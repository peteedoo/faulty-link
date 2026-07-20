# Roadmap — Faulty Link (community mesh network)

**Compiled:** 2026-07-19
**Active track:** Denver pilot — Eiber neighborhood chapter
**Branch / PR:** none active

Faulty Link packages Meshtastic + LoRa into a **community product**: hardware
recipes, a Go/Python bridge, a recruiting site, and a chapter-based expansion
model a non-technical organizer can actually run. This is the ordered plan from
**today** to a **repeatable "Chapter in a Box"**. Each phase has a **gate** — do
not skip gates marked **blocker**.

See `PLAN.md` for the full product vision, personas, and hardware BOMs.

---

## North star

| Goal | How we get there |
|------|------------------|
| A neighborhood coordinates when the internet is down | Meshtastic/LoRa mesh, no ISP, no cell towers, no monthly fee |
| A non-technical organizer can run a chapter | Onboarding playbook + recruiting site + health dashboard, not a research project |
| Chapters are replicable, not bespoke | Open-source "Chapter in a Box": site template + BOMs + Pi gateway playbook |
| The bridge makes the mesh legible | `faulty-link-backend` (Meshtastic → REST) + `faulty-gateway` feed a dashboard |

---

## Current state (honest)

| Item | Status |
|------|--------|
| Recruiting site (`faulty-link`) | Live static site — Home / Start / Den / Den Events / Den Eiber; config-driven via `js/config.js` |
| Signup flow | Works in `clipboard`/`mailto` modes; `postJson` needs a real endpoint |
| Hardware BOMs | Documented in `PLAN.md` (Starter ~$28–45, Neighborhood solar node ~$85–140) |
| `faulty-link-backend` | Separate repo — Go bridge Meshtastic → REST JSON |
| `faulty-gateway` | Separate repo — reverse proxy / health aggregation |
| Physical nodes deployed | **None confirmed live** — pilot not yet in the field |
| Health dashboard | **Not built** — backend exists, no UI consuming it |

---

## Phase 0 — Nail the pilot scope (you, ~1 evening)

**Gate:** one target block in Eiber and a node count committed.

- [ ] Pick the Eiber pilot block; confirm 3–5 households in
- [ ] Decide starter vs. neighborhood-node mix and set a per-household budget
- [ ] Finalize `js/config.js` for the Den/Eiber chapter (nav, signup fields)
- [ ] Choose a signup backend: keep `clipboard`/`mailto`, or stand up `postJson`

**Done when:** you know exactly who, where, how many nodes, and how signups land.

---

## Phase 1 — Bench mesh (2–3 nodes on a table) — **blocker**

**Gate:** two nodes exchange text over LoRa with the phone app; no field deploy until this works.

1. [ ] Flash 2–3 Heltec V3 nodes (Meshtastic Web Flasher, region **US 915 MHz**)
2. [ ] Pair with the Meshtastic app; confirm node-to-node text + position
3. [ ] Stand up a Pi gateway running `faulty-link-backend`; confirm mesh → REST JSON
4. [ ] Sanity-check `faulty-gateway` in front of the backend

**Done when:** a message on one node shows up in the backend's REST feed via the gateway.

---

## Phase 2 — First outdoor node (weatherproof, solar)

**Gate:** a gutter/roofline node holds a link across at least one block.

- [ ] Build one Neighborhood Node per `PLAN.md` (solar + 18650 + IP65 box + 5 dBi omni)
- [ ] Mount at gutter height (~3m); measure real range to a handset
- [ ] Verify solar keeps it up overnight (battery doesn't drain to cutoff)

**Done when:** an unattended outdoor node stays online 48h and links ≥0.5 mi.

---

## Phase 3 — Health dashboard

**Gate:** an organizer can see mesh health without SSHing into anything.

- [ ] Build a simple dashboard consuming `faulty-link-backend` (nodes, last-seen, battery, RSSI)
- [ ] Host alongside the static site (or via `faulty-gateway`)
- [ ] Add a "mesh is healthy" glance view for the HOA-volunteer persona

**Done when:** Devon (HOA tech volunteer) can confirm the mesh is up from a browser.

---

## Phase 4 — Eiber pilot deployment

**Gate:** 3–5 households have a working node and can reach each other.

- [ ] Distribute/build nodes with pilot households; label and log each
- [ ] Confirm each household appears on the dashboard
- [ ] Run a field test (split across the block; send/receive; log range)
- [ ] Capture results in `TEST_REPORT.md`

**Done when:** the Eiber block can text end-to-end with the internet unplugged.

---

## Phase 5 — Chapter in a Box (repeatable kit)

**Gate:** a new city could fork the repo and stand up a chapter unaided.

- [ ] Turn the site into a fork-and-fill template (config-only customization)
- [ ] Publish BOMs with live purchase links + Pi gateway playbook (Ansible or scripted)
- [ ] Write the field-test + neighborhood-onboarding playbook
- [ ] Document the chapter expansion model (Year 1: 3–5 Denver-metro chapters)

**Done when:** the repo is a self-serve "Chapter in a Box" with no tribal knowledge required.

---

## Deferred / probably never

| Item | Condition to revisit |
|------|----------------------|
| Subscription revenue | Never — conflicts with the resilience/no-monthly-fee ethos |
| Voice / ham-style operation | Out of scope; text + telemetry only |
| Non-US frequency bands | Only when deploying outside North America (verify ISM band) |

---

## Decision log (already made)

1. **Meshtastic + LoRa, US 915 MHz** — license-free, cheap, self-healing; the wedge vs. ham/satellite/goTenna.
2. **Product, not toolkit** — ship onboarding playbook + gateway bridge + dashboard, not just firmware.
3. **Static, founder-maintainable site** — pure HTML/CSS/JS, no build step, config-driven (`js/config.js`).
4. **Denver-first** — prove Eiber, then franchise via "Chapter in a Box".

---

## Next three actions (if you only do three things)

1. **Phase 1** — get 2–3 Heltec nodes talking on the bench + backend ingesting
2. **Phase 0** — lock the Eiber pilot block and node budget
3. **Phase 2** — build one solar outdoor node and measure real range

---

## Related docs

| Doc | Use |
|-----|-----|
| `PLAN.md` | Full product vision, personas, hardware BOMs |
| `README.md` | Site structure + `js/config.js` control center |
| `docs/bootcamp.md` | Onboarding material |
| `TEST_REPORT.md` | Field-test results (fill during Phase 4) |
| `peteedoo/faulty-link-backend` | Meshtastic → REST bridge |
| `peteedoo/faulty-gateway` | Reverse proxy / health aggregation |
