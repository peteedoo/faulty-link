#!/usr/bin/env python3
"""Independent structural + HTTP + header verification for Faulty Link."""
from __future__ import annotations

import base64
import hashlib
import http.server
import re
import socketserver
import sys
import threading
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ISSUES: list[str] = []


def fail(msg: str) -> None:
    ISSUES.append(msg)
    print("FAIL:", msg)


def ok(msg: str) -> None:
    print("OK:", msg)


def sha384_integrity(path: Path) -> str:
    digest = hashlib.sha384(path.read_bytes()).digest()
    return "sha384-" + base64.b64encode(digest).decode()


def check_structure() -> None:
    pages = sorted(
        p for p in ROOT.glob("**/index.html") if "editor" not in p.parts and "node_modules" not in p.parts
    )
    if len(pages) != 5:
        fail(f"expected 5 pages, got {len(pages)}")
    descs: list[str] = []
    css_hash = sha384_integrity(ROOT / "css/styles.css")
    js_hash = sha384_integrity(ROOT / "js/site.js")
    ok(f"css integrity {css_hash}")
    ok(f"js integrity {js_hash}")

    for p in pages:
        t = p.read_text(encoding="utf-8")
        rel = str(p.relative_to(ROOT))
        required = {
            "skip-link": "skip-link" in t and 'href="#main"' in t,
            "main#id": 'id="main"' in t,
            "canonical": 'rel="canonical"' in t,
            "csp": "Content-Security-Policy" in t,
            "og:title": "og:title" in t,
            "twitter:card": "twitter:card" in t,
            "data-home": "data-home" in t,
            "aria-live nav": 'aria-live="polite"' in t,
            "site header label": 'aria-label="Site"' in t,
            "hero header": 'class="hero"' in t and "<header class=\"hero\">" in t,
            "no inline margin-top": 'style="margin-top' not in t,
            "css sri": css_hash in t and "crossorigin" in t,
            "js sri": js_hash in t and 'type="module"' in t,
        }
        for k, v in required.items():
            if not v:
                fail(f"{rel}: missing {k}")
        m = re.search(r'name="description" content="([^"]+)"', t)
        if not m:
            fail(f"{rel}: missing description")
        else:
            descs.append(m.group(1))

    if len(descs) != len(set(descs)):
        fail(f"duplicate descriptions: {descs}")
    else:
        ok(f"unique descriptions ({len(descs)})")

    home = (ROOT / "index.html").read_text(encoding="utf-8")
    if "application/ld+json" not in home or "Organization" not in home:
        fail("home missing JSON-LD Organization/WebSite")
    else:
        ok("home JSON-LD present")

    ev = (ROOT / "den/events/index.html").read_text(encoding="utf-8")
    if ev.count("<h3>") < 3:
        fail("events missing h3 titles")
    else:
        ok("events h3 titles")

    css = (ROOT / "css/styles.css").read_text(encoding="utf-8")
    for needle in (".skip-link", ".mt-18", ".visually-hidden", ".field-error", "--muted:#4b5563", "--z-modal"):
        if needle not in css:
            fail(f"css missing {needle}")
    ok("css audit hooks")

    js = (ROOT / "js/site.js").read_text(encoding="utf-8")
    for needle in (
        "TOAST_TIMEOUT_MS",
        "signupRecipient",
        "toEncoded",
        "aria-invalid",
        "aria-busy",
        'credentials: "omit"',
        "style=",  # should NOT appear as inline style attr builder
    ):
        if needle == "style=":
            # allow comments mentioning style=""; block actual attribute construction
            if 'class="modal-backdrop" style=' in js or "style=\"z-index" in js:
                fail("js still sets inline style on modal")
            continue
        if needle not in js:
            fail(f"js missing {needle}")
    ok("js audit hooks")

    cfg = (ROOT / "js/config.js").read_text(encoding="utf-8")
    if "info@iamfaulty.com" in cfg:
        fail("plaintext email still in config.js")
    if "toEncoded" not in cfg:
        fail("config missing toEncoded")
    ok("email obfuscated in config")

    headers = (ROOT / "_headers").read_text(encoding="utf-8")
    for h in (
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "Strict-Transport-Security",
        "Content-Security-Policy",
    ):
        if h not in headers:
            fail(f"_headers missing {h}")
    ok("_headers declarations present")

    for name in ("robots.txt", "sitemap.xml"):
        if not (ROOT / name).exists():
            fail(f"missing {name}")
    ok("robots + sitemap present")


class HeaderAwareHandler(http.server.SimpleHTTPRequestHandler):
    """Serve workspace files and apply root _headers rules (Cloudflare-like)."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # Apply /* rules from _headers
        rules = (ROOT / "_headers").read_text(encoding="utf-8")
        apply = False
        for line in rules.splitlines():
            raw = line.strip()
            if not raw or raw.startswith("#"):
                continue
            if not raw.startswith(" ") and not raw.startswith("\t") and raw.endswith("/*") is False and ":" not in raw:
                # path pattern line
                apply = raw == "/*" or raw.startswith("/*")
                continue
            if apply and ":" in raw:
                # continuation header lines are indented in CF format; our file uses 2-space indent
                key, _, val = raw.partition(":")
                self.send_header(key.strip(), val.strip())
        super().end_headers()

    def log_message(self, fmt, *args):  # quieter
        pass


def parse_headers_file() -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    apply = False
    for line in (ROOT / "_headers").read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.strip().startswith("#"):
            continue
        if not line[:1].isspace() and ":" not in line:
            apply = line.strip() == "/*"
            continue
        if apply and ":" in line:
            k, _, v = line.strip().partition(":")
            out.append((k.strip(), v.strip()))
    return out


class QuietTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def check_http() -> None:
    # Fix handler: Cloudflare _headers format is:
    # /*
    #   Header: value
    declared = parse_headers_file()
    if len(declared) < 6:
        fail(f"parsed too few headers from _headers: {declared}")
    else:
        ok(f"parsed {len(declared)} header rules from _headers")

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(ROOT), **kwargs)

        def end_headers(self):
            for k, v in declared:
                self.send_header(k, v)
            super().end_headers()

        def log_message(self, fmt, *args):
            pass

    httpd = QuietTCPServer(("127.0.0.1", 0), Handler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{port}"
    try:
        paths = [
            "/",
            "/start/",
            "/den/",
            "/den/events/",
            "/den/eiber/",
            "/css/styles.css",
            "/js/site.js",
            "/js/config.js",
            "/favicon.svg",
            "/robots.txt",
            "/sitemap.xml",
        ]
        for path in paths:
            url = base + path
            with urllib.request.urlopen(url, timeout=5) as resp:
                code = resp.getcode()
                if code != 200:
                    fail(f"HTTP {code} {path}")
                else:
                    ok(f"HTTP 200 {path}")
                if path == "/":
                    # HEAD-equivalent header check via GET headers
                    wanted = {
                        "X-Frame-Options": "DENY",
                        "X-Content-Type-Options": "nosniff",
                        "Referrer-Policy": "strict-origin-when-cross-origin",
                        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
                    }
                    for hk, hv in wanted.items():
                        got = resp.headers.get(hk)
                        if got != hv:
                            fail(f"header {hk}: got {got!r} want {hv!r}")
                        else:
                            ok(f"header {hk}={got}")
                    csp = resp.headers.get("Content-Security-Policy", "")
                    for part in ("default-src 'self'", "frame-ancestors 'none'", "object-src 'none'"):
                        if part not in csp:
                            fail(f"CSP missing {part}")
                    ok(f"CSP present ({len(csp)} chars)")
                    hsts = resp.headers.get("Strict-Transport-Security", "")
                    if "max-age=" not in hsts:
                        fail(f"HSTS missing/invalid: {hsts!r}")
                    else:
                        ok(f"HSTS={hsts}")
    finally:
        httpd.shutdown()


def main() -> int:
    print("ROOT", ROOT)
    check_structure()
    check_http()
    print("ISSUES", len(ISSUES))
    for i in ISSUES:
        print(" -", i)
    return 1 if ISSUES else 0


if __name__ == "__main__":
    sys.exit(main())
