# 30-Day Go + Python DevOps Bootcamp

**Books:** *Network Programming with Go* (Woodbeck) + *Python for DevOps* (Gift et al.)  
**Pace:** ~1.5 hrs/day. Read → build → push. No skipping build days.  
**Goal:** TPM portfolio artifacts + real tooling for **Faulty Link** (off-grid mesh network — Pi Zero 2 W gateway + ESP32 Meshtastic nodes).

The capstone is a Faulty Link mesh backend: a Go HTTP bridge that talks to Meshtastic nodes over serial/TCP, and a Python CLI that polls it, displays node health, and alerts on dropped nodes. Real infrastructure for a real product.

---

## Week 1 — Python Foundations (Days 1–7)

**Day 1 — Setup + Python CLI basics**
- Read: *PfD* Ch 1 (Python essentials refresher, shell basics)
- Build: Script that scans a directory, prints file count + total size. Works on `~/homelab-data/`.
- Push to GitHub.

**Day 2 — Shell scripting with Python**
- Read: *PfD* Ch 2 (automating the shell, subprocess)
- Build: Python wrapper that runs `docker ps` and formats the output into a clean table.

**Day 3 — Working the command line**
- Read: *PfD* Ch 3 (click/argparse, building CLI tools)
- Build: Add a `--json` flag to your Day 2 script. Output structured JSON or pretty table.

**Day 4 — Linux utilities + process management**
- Read: *PfD* Ch 4 (psutil, disk/process monitoring)
- Build: Homelab health script — CPU, RAM, disk on `~/homelab-data/`, top 5 processes. Runs on a cron.

**Day 5 — Package management + project hygiene**
- Read: *PfD* Ch 5 (virtualenvs, pip, pyproject.toml)
- Task: Refactor all week's scripts into a clean Python package with a `requirements.txt` and `README.md`.

**Day 6 — Testing**
- Read: *PfD* Ch 6 (pytest, mocking, test structure)
- Build: Write tests for your Day 3 CLI. At least 5 test cases. CI mindset — every function has a test.

**Day 7 — Build Day**
- Combine Days 1–6 into one `homelab-monitor` CLI tool. Run it. Make sure it works.
- Push to GitHub. Write a 3-sentence README explaining what it does and why you built it.

---

## Week 2 — Python DevOps Applied + Go Bootstrap (Days 8–14)

**Day 8 — CI/CD**
- Read: *PfD* Ch 7 (CI concepts, GitHub Actions basics)
- Build: Add a `.github/workflows/test.yml` to your homelab-monitor repo. Tests run on every push.

**Day 9 — Docker via Python + meshtastic-python intro**
- Read: *PfD* Ch 8 (Docker SDK for Python)
- Build: Script that lists all containers, their status, and uptime. Replaces `docker ps` for your daily check.
- Side: Install `meshtastic` Python library. Connect your ESP32 node via USB and run `meshtastic --info`. Read the output. Get familiar with what the library exposes (node ID, battery, SNR, last heard).

**Day 10 — Automation patterns**
- Read: *PfD* Ch 9 (cloud automation, idempotency, error handling)
- Build: Make your Docker script idempotent — safe to run 10x, same output every time. Add retry logic.

**Day 11 — Infrastructure as code thinking + Faulty Link node config**
- Read: *PfD* Ch 10 (IaC, config management concepts)
- Task: Document your homelab stack in a YAML manifest. Then write `baseline.yaml` for Faulty Link using this exact schema — it's what your Python CLI will load and diff against:
  ```yaml
  nodes:
    - id: "!abcd1234"        # Meshtastic node ID (hex)
      name: "eiber-gw"
      role: gateway           # gateway | repeater | handset
      alert_after_minutes: 5  # alert if not heard within this window
    - id: "!ef567890"
      name: "node-roof"
      role: repeater
      alert_after_minutes: 15
  ```
- Pin your Meshtastic firmware version in a `hardware.md` file today. Risk: firmware updates can break protobuf schemas. Don't upgrade mid-build.

**Day 12 — Go Day 1: syntax and structure**
- Install Go. Read the official Tour of Go (https://go.dev/tour) through "Basics."
- Build: Hello World. Then: a function that takes a slice of strings and returns the longest one. Get comfortable with `fmt`, `main`, types, loops.

**Day 13 — Go Day 2: errors and functions**
- Read: Tour of Go — "Methods and Interfaces" + error handling section.
- Build: A Go program that reads a file, counts lines, and returns an error if the file doesn't exist. No panics.

**Day 14 — Build Day**
- Python: write a `mesh-poll.py` script using meshtastic-python. Connect to your node, pull all visible nodes, print: node ID, short name, battery %, SNR, last heard. This is the seed of the Faulty Link CLI.
- Go: a file stats tool — given a path, print file count, total size, newest file. Same as Day 1 but in Go.
- Push both. Note what felt different between languages.

---

## Week 3 — Go Networking (Days 15–21)

**Day 15 — Networking fundamentals + Go's net package**
- Read: *NPwG* Ch 1 (OSI model, Go net package overview)
- Build: A Go program that resolves a hostname to IP(s). Test it against `your-server.local` and another device on your LAN.

**Day 16 — TCP + Meshtastic TCP mode**
- Read: *NPwG* Ch 2 (TCP, listeners, connections)
- Build: TCP echo server + client. Client sends a message, server echoes it back. Test locally.
- Faulty Link context: Meshtastic supports a TCP interface mode — the node acts as a TCP server on port 4403. This is how your Go bridge will talk to it. Read the Meshtastic TCP interface docs so you know what's coming in week 4.

**Day 17 — UDP**
- Read: *NPwG* Ch 3 (UDP, datagrams)
- Build: UDP listener that logs incoming packets with timestamp + source IP. Run it on your homelab network, ping it from another device.

**Day 18 — DNS**
- Read: *NPwG* Ch 4 (DNS resolution in Go)
- Build: Go CLI that does forward + reverse DNS lookup for any IP/hostname. Useful for debugging your homelab network.

**Day 19 — HTTP servers in Go**
- Read: *NPwG* Ch 5 (net/http, handlers, routing)
- Build: HTTP server that returns your homelab container status as JSON at `GET /status`. Reuse your Day 9 Python logic as the spec.

**Day 20 — TLS**
- Read: *NPwG* Ch 6 (TLS, certificates, secure connections)
- Build: Add TLS to your Day 19 server using a self-signed cert. Test with `curl -k`.

**Day 21 — Build Day**
- Your Go HTTP status server from Days 19–20, running and serving JSON.
- A Python script that calls it and prints a formatted report.
- Push both. This is a two-language system — document how they talk to each other.

---

## Week 4 — Advanced Go + Capstone (Days 22–30)

**Day 22 — Unix domain sockets**
- Read: *NPwG* Ch 7 (Unix sockets, IPC)
- Build: Two Go processes communicating over a Unix socket. One writes metrics, one reads and prints them.

**Day 23 — Packet inspection**
- Read: *NPwG* Ch 8 (raw packets, pcap/gopacket)
- Build: Capture 10 seconds of traffic on your homelab network interface. Print source/dest IPs and protocols. Eye-opener.

**Day 24 — SSH in Go + Pi Zero gateway health**
- Read: *NPwG* Ch 9 (golang.org/x/crypto/ssh)
- Build: Go tool that SSHes into the Pi Zero 2 W gateway, runs `uptime`, `df -h`, and checks if the meshtastic process is running. Returns structured output. This becomes part of the Faulty Link capstone's gateway health check.

**Day 25 — Weakest link day**
- Review your notes from weeks 1–3. Pick the one topic that felt shakiest.
- Redo that chapter. Rewrite that build from scratch without looking at your old code.

**Day 26 — Faulty Link capstone design**
- No reading. Write a one-page spec as `docs/architecture.md` in the repo:
  - **Decision:** Pi Zero 2 W runs `meshtasticd` (Linux native daemon, not USB serial). Go bridge connects to `meshtasticd` via TCP port 4403. Document why: `meshtasticd` is more reliable for 24/7 operation than serial; TCP gives you a stable interface to test against without physical hardware.
  - **Go bridge service:** connects to TCP 4403, subscribes to protobuf packets (`NodeInfo`, `Telemetry`, `Position`), exposes `GET /mesh/nodes` and `GET /mesh/health`.
  - **Python CLI:** polls the Go bridge every 30s, renders live table, diffs against `baseline.yaml`, prints ANSI red alert when a node exceeds its `alert_after_minutes` threshold.
  - List 3 risks using the actual risks from `FAULTY_LINK_PLAN.md`: urban range limits, Pi Zero RAM exhaustion, meshtastic firmware breaking changes. This is the TPM muscle — document the risks before you build.

**Day 27 — Capstone: Go bridge service**
- Build the Go Meshtastic bridge. Key decisions:
  - Connect to `meshtasticd` via TCP 4403 (not direct serial)
  - Meshtastic uses protobuf — use `github.com/meshtastic/go` (the official Go bindings) rather than parsing the stream manually
  - Parse `NodeInfo`, `Telemetry`, and `Position` packet types; ignore others for now
  - Expose `GET /mesh/nodes` returning JSON array; `GET /mesh/health` returning gateway uptime + offline node count
  - Pin the `go-meshtastic` dependency to a specific version — firmware breaking changes are Risk #3 in your spec

**Day 28 — Capstone: Python CLI**
- Build the Python frontend. It should: poll `GET /mesh/nodes`, render a table (node name, battery, SNR, last heard, status), load your Day 11 YAML baseline, and print `ALERT: [node] offline` for any node missing for >10 minutes.

**Day 29 — Polish**
- Tests for both components (at least happy path + one error case each).
- README for each repo: what it does, how to run it, why you built it.
- Record a 2-minute screen capture of it running. That's your demo artifact.

**Day 30 — Ship it**
- Push Go bridge + Python CLI to a new `faulty-link-backend` repo (or a `backend/` folder in the existing repo).
- Write a 250-word TPM case study: *what the Faulty Link mesh problem is, how you scoped the backend, what broke, what you'd do differently, what it proves about your technical range.*
- File the case study in your portfolio folder. Link it from the Faulty Link site's README.

---

## Logistics

| Item | Detail |
|---|---|
| Daily log | Keep a `notes.md` in each project. One line per day: what you built, what broke, what you learned. |
| Stuck > 20 min | Google first, then ask. Write down what you tried before asking. |
| Skip a day | Double up the next day. Don't skip build days — reading without building doesn't stick. |
| Portfolio target | Days 7, 14, 21, 30 produce shippable artifacts. Four GitHub pushes minimum. |

---

*Nothing matters. Ship the code anyway.*
