# Faulty Link — Product & Project Plan
*Last updated: 2026-05-20*

---

## 1. PRODUCT VISION

### What Faulty Link Really Is
Faulty Link is a **portable, internet-independent mesh communication network** that any community can turn on with zero ISP involvement, zero cell towers, and zero monthly fees. It is not a product you buy—it is a **template for community-owned infrastructure**: hardware configurations, open-source software bridges, and a playbook for organizing neighbors around resilient local communication.

At its core, Faulty Link solves a single problem: **when the internet disappears, how does a neighborhood still coordinate?** Cell networks congest or fail in emergencies. Satellite is expensive and high-latency. Meshtastic + LoRa provides a dirt-cheap, license-free, self-healing layer that keeps text and telemetry flowing node-to-node even when every other pipe is dry.

### Three Specific Personas

**1. The Preparedness-Minded Neighbor (Eiber, CO)**
Sarah lives in a 1950s ranch in Lakewood. She does not identify as a "prepper," but she lived through the 2021 Marshall Fire and watched neighbors lose communication for hours while evacuation orders spread. She wants something her block can leave plugged in year-round—solar, silent, zero maintenance—that lets her text the next block over if Comcast and Verizon both go down. She will not flash firmware. She will plug something in and trust it works.

**2. The Hike/Climb Group Organizer (Front Range)**
Marcus leads a 12-person climbing collective. They operate above treeline on 14ers where cell coverage is theoretical. He needs a lightweight, battery-powered mesh so the group can split into rope teams, spread across a ridge, and still share location and status without shouting or expensive Garmin inReach subscriptions per person. Cost per person matters; weight matters; range matters.

**3. The Neighborhood Association Tech Volunteer (Any City)**
Devon is the one person on their HOA board who knows what a Raspberry Pi is. They want to deploy a semi-permanent neighborhood mesh for emergency coordination and low-speed community messaging ("block party moved to 4pm," "lost dog"). They need a **deployable blueprint**, not a research project: a BOM they can hand to the board, a configuration they can replicate, and a dashboard that shows the board the mesh is healthy without anyone SSHing into a Linux box.

### The Problem Nothing Else Solves
- **Ham radio** requires licensing, voice-only protocols, and technical fluency that excludes 95% of neighbors.
- **Satellite messengers** (inReach, Zoleo) work one-to-one, cost $15-50/month per device, and rely on commercial satellite constellations.
- **Cellular mesh** (goTenna) is proprietary, expensive, and the company can sunset the product.
- **Standard Meshtastic** is powerful but a *toolkit*, not a *system*. It does not ship with a neighborhood onboarding playbook, a gateway bridge, or a health dashboard.

Faulty Link's unique wedge: **it packages Meshtastic into a community product**—complete with hardware recipes, a Go/Python software bridge, a static website for recruiting, and a chapter-based expansion model that a non-technical organizer can actually run.

### 2-Year Vision (Denver Pilot → Beyond)
If the Denver pilot works, Faulty Link becomes a **franchiseable mesh deployment kit**:
- **Year 1:** 3-5 Denver-metro chapters (Eiber pilot + 2-4 adjacent neighborhoods), each with 6-12 nodes and 1 gateway. Software stack matures to web dashboard + node provisioning.
- **Year 2:** Open-source "Chapter in a Box"—a GitHub repo any city can fork containing the static site template, hardware BOMs with AliExpress/Amazon links, Ansible playbooks for Pi gateway setup, and a field-test playbook. Ten cities launch autonomous chapters. Revenue model (if any) is hardware-kit affiliate markup or modest consultancy for HOA deployments—not subscriptions, keeping it aligned with resilience ethos.

---

## 2. HARDWARE ARCHITECTURE

### Regional Note
All recommendations assume **US ISM 915 MHz** operation. Verify frequency bands if deploying outside North America.

---

### A. Starter Kit (1 Person, Low Cost)
*Goal: Get on the mesh for under $50. Carryable. Phone-configurable.*

| Component | Recommendation | Est. Price | Source |
|-----------|---------------|------------|--------|
| Node | **Heltec WiFi LoRa 32 V3** (ESP32-S3 + SX1262, 915 MHz, 0.96" OLED) | $18-22 | Heltec AliExpress store, Amazon ("Heltec LoRa 32 V3 915MHz") |
| Battery | 3.7V 2000 mAh LiPo with JST-PH 2.0 connector | $6-10 | Adafruit, Amazon |
| Case | 3D-printed "Meshtastic Starter Case" or generic 100x60x25 mm project box | $3-5 (print) / $8 (box) | Printables.com, Amazon |
| Antenna | Stock antenna included; upgrade later to 5.5 dBi flexible whip | $0 (stock) / $8 (upgrade) | Amazon |
| **Total** | | **~$28-45** | |

**Why this config:** The Heltec V3 is the community's default entry point. It includes the OLED (so the node displays its own status without a phone), integrated USB-C charging, and broad Meshtastic firmware support. It is not the most power-efficient option, but for a personal handset charged nightly, it is unbeatable on price.

**Setup time:** 30 min (flash firmware via Web Flasher, pair with Meshtastic Android/iOS app, set region to US).

---

### B. Neighborhood Node (Semi-Permanent, Weatherproof, Solar)
*Goal: Set-and-forget outdoor repeater that extends mesh coverage across a residential block.*

| Component | Recommendation | Est. Price | Source |
|-----------|---------------|------------|--------|
| Node | **Heltec WiFi LoRa 32 V4** (ESP32-S3 + SX1262, improved PA, lower sleep current) OR **Heltec Wireless Stick Lite V3** (no screen, cheaper, lower power) | $22-28 (V4) / $15 (Stick Lite) | Heltec store, AliExpress |
| Solar Panel | 5V 2W monocrystalline panel (approx 120x120 mm) | $8-12 | Amazon ("5V solar panel ESP32") |
| Battery | 3.7V 3000-5000 mAh 18650 Li-ion with protection board | $8-15 | Adafruit, battery specialists |
| Charge Controller | CN3065 or TP4056-based 1A solar charge module | $3-5 | Amazon, Adafruit |
| Enclosure | **BUD Industries NBF-32016** or similar ABS IP65 box (8x6x3 in) | $12-18 | Amazon, Digi-Key |
| Antenna | **5 dBi outdoor 915 MHz omnidirectional** (RP-SMA) with 3m coax | $12-18 | Amazon ("915MHz LoRa antenna outdoor") |
| Cable Glands | PG7/PG9 nylon cable glands for antenna and solar ingress | $3-5 | Amazon |
| Mounting | Universal gutter mount or J-pole for antenna elevation | $10-20 | Amazon, hardware store |
| **Total** | | **~$85-140** | |

**Critical build notes:**
- The V4's integrated SOL connector simplifies solar wiring vs. V3, but a basic TP4056 module works on either.
- Antenna height is the single biggest range factor. A node at gutter height (~3m) achieves ~0.5-1.5 mile suburban links. At roofline (~6m), 1-3 miles is realistic.
- Use the **LongSlow** preset for maximum range on backbone/repeater nodes.
- Power budget: Heltec V4 in deep sleep ~140 µA; active RX ~15 mA; TX ~300 mA. With a 3000 mAh battery and 2W solar, a Colorado-sun setup should sustain year-round except during heavy snow cover.

---

### C. Gateway Node (Pi Zero 2 W Setup)
*Goal: 24/7 indoor bridge between the mesh and local WiFi. Runs the Go HTTP service, stores telemetry, exposes REST API.*

| Component | Recommendation | Est. Price | Source |
|-----------|---------------|------------|--------|
| SBC | **Raspberry Pi Zero 2 W** (512 MB RAM, WiFi/BT) | $15 | Approved resellers (Pishop.us, Adafruit) |
| Storage | SanDisk 32 GB microSD (Class 10, endurance-rated preferred) | $8-12 | Amazon |
| LoRa Radio | **Waveshare SX1262 LoRa HAT (915 MHz)** OR **Heltec V3/V4 via USB** as external serial node | $25-35 (HAT) / $20-28 (Heltec USB) | Amazon, The Pi Hut, AliExpress |
| Power | Official Pi Zero 2 W power supply (5V 2.5A) or quality USB-C 15W | $8-10 | Adafruit, Amazon |
| Enclosure | Official Pi Zero case or Flirc passive aluminum case | $5-10 | Amazon |
| **Total** | | **~$60-90** | |

**Why Pi Zero 2 W:** It is the cheapest always-on Linux board with WiFi that can run `meshtasticd` natively plus your custom Go bridge. The 512 MB RAM is tight but sufficient for meshtasticd + a lightweight Go HTTP service + Python CLI polling. It draws ~0.5-1W, costing roughly $1-2/year in electricity.

**OS & Config:**
1. **OS:** Raspberry Pi OS Lite (64-bit). No desktop. Enable SSH and WiFi via `raspi-config` or boot partition `wpa_supplicant.conf`.
2. **Meshtastic daemon:** Install `meshtasticd` from the official .deb releases (see Meshtastic Linux Native docs). Configure `/etc/meshtasticd/config.yaml` with HAT pinout (Waveshare SX1262 HAT typically uses SPI with CS=21, IRQ=16, Busy=20, Reset=18—verify against Waveshare wiki).
3. **Firewall:** `ufw` allowing 4403 (Meshtastic TCP), 8080 (your Go bridge, if exposed), and SSH.
4. **Reliability:** Enable `watchdog` in `/boot/firmware/config.txt`. Set up a cron health check that restarts `meshtasticd` if the TCP port goes dark.
5. **Go Bridge Deployment:** Cross-compile or build natively. Run as systemd service. Log to `/var/log/faulty-link/` with logrotate.

**Alternative if Pi Zero 2 W is unavailable:** Raspberry Pi 3 A+ (~$25) or Pi 4 (overkill, higher power). Do not use Pico W—it does not run `meshtasticd` with a full HTTP API.

---

## 3. SOFTWARE ROADMAP (Phased)

### Phase 1: Bootcamp Ship (July 7)
*Goal: Working developer toolchain that proves the concept.*

**What ships:**
- **Go HTTP Bridge** (`/mesh/nodes`, `/mesh/health`): Connects to local `meshtasticd` via TCP 4403. Subscribes to `NodeInfo`, `Telemetry`, and `Position` protobuf packets. Serves JSON over HTTP.
- **Python CLI Monitor:** Polls Go bridge every 30s. Renders a live table of node IDs, last-heard timestamps, battery level, SNR. Diffs against a committed `baseline.yaml`. Prints color-coded console alerts when a node drops offline >5 minutes.
- **YAML Baseline Format:** Human-editable list of expected nodes with friendly names, roles (`handset`, `repeater`, `gateway`), and alert thresholds.

**Success criteria for July 7:**
- [ ] 3+ physical nodes on a desk passing messages through the mesh.
- [ ] Go bridge returns accurate node list within 10s of a node joining/leaving.
- [ ] Python CLI emits an audible bell / ANSI red alert when a node in `baseline.yaml` has not been heard for >threshold.
- [ ] Code is committed to `github.com/peteedoo/faulty-link` with a `README.md` that explains how to run it.

---

### Phase 2: Three Months Out (October 2026)
*Goal: Make the mesh observable by non-technical users. Start bridging to the web.*

**Priority 1: Web Dashboard (Static or Lightweight Server)**
- A single-page web dashboard served either:
  - Statically (rebuilt by a Go template generator or small Node script) and dropped into the community site's `/dashboard/` path, or
  - Directly by the Go bridge (embedded `net/http` serving a React/Vue/HTMX frontend).
- Given the solo builder constraint and 1.5 hrs/day, **HTMX + Go templates** is the pragmatic choice. No build step. One binary.
- Dashboard shows: live node map (leaflet.js with GPS positions), node health grid (online/offline/battery), message traffic volume graph (simple SVG sparkline), and recent mesh messages (if privacy settings allow).

**Priority 2: Mobile-First Admin View**
- The dashboard must be responsive. The organizer checking mesh health from their phone at a field test is the primary user.

**Priority 3: MQTT Bridge (Experimental)**
- `meshtasticd` can publish to MQTT. Enable this on the gateway to forward encrypted mesh packets to a public MQTT broker (or self-hosted Mosquitto on the Pi). This creates a path for:
  - Remote monitoring without exposing the Pi directly to the internet.
  - Future integration with Home Assistant or Node-RED.

**Priority 4: Automated Pi Provisioning Script**
- A single `install.sh` that:
  - Installs `meshtasticd` from GitHub releases.
  - Installs the Go bridge binary.
  - Writes systemd service files.
  - Prompts for WiFi SSID, mesh region, and node name.
- This turns gateway setup from a 2-hour manual process into a 10-minute one.

---

### Phase 3: Six Months Out (January 2027)
*Goal: Deployable by a non-technical neighborhood organizer with zero CLI interaction.*

**Priority 1: Node Provisioning Mobile Flow**
- Organizer buys a Heltec V4, opens a web page on `faulty-link.org/provision`, and:
  1. Selects their chapter (Denver, etc.).
  2. Downloads a pre-built firmware bin with correct region, channel settings, and chapter key pre-baked.
  3. Flashes via the browser using the **Meshtastic Web Flasher** (WebSerial API) with a single click.
- This eliminates the need for new users to understand "primary channel" vs. "secondary channel" or modem presets.

**Priority 2: Self-Service Chapter Spawn**
- A "Start a Chapter" flow on the site:
  1. Organizer enters city name and email.
  2. Receives a zip containing:
     - A forked static site with their chapter slug (`/nyc/`, `/sea/`, etc.).
     - Pre-generated channel QR code and encryption key.
     - A PDF field-test playbook (see Section 4).
  3. Their chapter is listed in a global directory on the main site.

**Priority 3: Battery & Solar Calculator**
- Simple web form: enter latitude, average sun hours, node role (handset vs. repeater), desired autonomy days.
- Outputs recommended battery mAh and solar panel wattage with specific Amazon/Adafruit links.

**Priority 4: Alerting Integrations**
- Gateway supports webhooks: when a node drops offline, POST to Discord/Slack/webhook of organizer's choice.

---

## 4. DENVER PILOT PLAN

### A. Minimum Viable Mesh (Node Count & Placement)
For a **useful suburban test** in Eiber (Lakewood, CO), target **6 nodes minimum**:

| Node | Role | Hardware | Placement |
|------|------|----------|-----------|
| 1 | Gateway + Repeater | Pi Zero 2 W + Waveshare HAT | Builder's residence (interior, near window) |
| 2 | Repeater | Heltec V4 + solar | Builder's roof/gutter (elevated, backbone) |
| 3 | Repeater | Heltec V4 + solar | Volunteer 1, 0.5-1 mile from Node 2 |
| 4 | Handset | Heltec V3 + battery | Builder, carried during field tests |
| 5 | Handset | Heltec V3 + battery | Volunteer 2, carried |
| 6 | Fixed test node | Heltec V4 + battery | Volunteer 3, window sill (indoor coverage test) |

**Why 6:** Meshtastic's mesh routing becomes reliable with >4 nodes. At 6 nodes, you can test 2-hop routing and demonstrate that the network does not collapse if any single node fails. Urban/suburban range is 0.5-2 miles; Eiber's ~1 mile east-west span means 3 elevated nodes should blanket the neighborhood if one is on a roofline.

### B. Recruiting Participants
Given zero marketing budget and a solo builder:

**Tactic 1: Nextdoor + Hyperlocal Reddit**
- Post in r/Denver and r/Lakewood with a specific offer: "Free emergency communication node for your block. No monthly fee. Works when cell towers don't. Looking for 3 neighbors with roof/gutter access for solar-powered mesh repeaters."
- Include a photo of a working node with the OLED showing mesh status. Visual proof beats text.

**Tactic 2: Local Maker/Ham/Off-Grid Meetups**
- Denver has active Ham Radio and preparedness communities. Attend one meetup with a demo node. These communities are pre-sold on the problem; you just need to show the solution works.

**Tactic 3: Eiber Neighborhood Association**
- Pitch as "digital neighborhood watch infrastructure." Offer to present at one meeting with a live demo. Emphasize: no ongoing cost, no data collection, no corporate entity controlling the network.

**Incentive structure:** Early participants get hardware at cost (or free if the builder subsidizes 3 nodes). They become "Node Stewards"—not tech support, just people who agree to let a solar box sit on their gutter and text the builder if the OLED goes dark.

### C. Field Test Event Structure (`/den/events/`)
Run a **monthly "Mesh Walk"**—branded, repeatable, and photogenic.

**Schedule:** Second Saturday, 9:00 AM, 2 hours.

**Agenda:**
- **0:00-0:20** — Rally at a park or coffee shop (e.g., Carmody Park, Belmar area). Hand out charged handsets to attendees. Pair with phones.
- **0:20-1:20** — **Range Test Walk:** Group splits into two teams. Team A walks east, Team B walks west, sending scheduled messages every 5 minutes. Track maximum distance before messages fail, and map where relay nodes pick up the traffic.
- **1:20-1:40** — **Regroup & Download:** Pull `rangetest.csv` from nodes. Discuss findings. Celebrate the furthest successful hop.
- **1:40-2:00** — **Open QA:** Show the live dashboard (if available). Sign up new Node Stewards. Photo for social media.

**What to measure (see D):** Each field test produces a CSV of RSSI/SNR vs. distance. Over 3-4 months, these aggregate into a coverage map you can show the neighborhood association.

### D. Success Metrics

| Metric | How Measured | Target by Month 3 |
|--------|-------------|-------------------|
| Node uptime | Go bridge logs: % of time each node is heard in a 24h window | >95% for fixed nodes |
| Coverage area | GPS + rangetest.csv plotted on Google My Maps | 1.5 mile radius from gateway |
| Message delivery rate | Send 50 test messages during field test; count ACKs | >90% within coverage area |
| Participant retention | Node Stewards still active at 90 days | 3 of 3 initial stewards |
| Organizing velocity | New nodes added per month | ≥1 new node/month |

### E. Expansion: Eiber → Denver Metro
**Month 1-3:** Solidify Eiber. 6 nodes. One working field test with 5+ attendees.

**Month 4-6:** **Adjacent Neighborhood Seeding.**
- Identify 2-3 neighborhoods within 1-2 miles of Eiber (e.g., Morse Park, Belmar, Edgewater).
- Recruit 1 "Chapter Lead" in each. Give them a Starter Kit (Heltec V3) and a 30-minute video walkthrough.
- When their first node is online, it will mesh with Eiber's edge if within range—or you identify a "bridge location" (a home on the border) to link the two neighborhoods.

**Month 7-12:** **Vertical expansion inside Denver.**
- Target communities with natural alignment: hiking groups (Colfax Marathon training groups, 14er clubs), amateur radio clubs (Denver Radio Club), and neighborhood preparedness organizations.
- Each vertical is a separate "channel" in Meshtastic terms—hikers do not need to hear Eiber HOA chatter. Use Meshtastic's channel system to isolate traffic while sharing the same physical mesh backbone.

---

## 5. COMMUNITY & GROWTH

### Chapter-by-Chapter Playbook
Faulty Link grows like a **franchise, not a startup**. The builder does not scale; the playbook does.

**The Replication Kit:**
1. **Hardware BOM** with Amazon/AliExpress/Affiliate links (updated quarterly for availability).
2. **Forkable static site** (what exists today). A new chapter copies the repo, edits `js/config.js` for their city slug, and deploys to Cloudflare Pages in 10 minutes.
3. **Field Test Playbook** (PDF + video). A literal script for running the first Mesh Walk.
4. **Node Steward Agreement** (one-page PDF). Sets expectations: "I will let this solar box sit on my gutter. I will text the organizer if the screen goes blank. I understand this is experimental."

**The Expansion Rule:** A new chapter must have:
- 1 committed Chapter Lead (not the builder).
- 3 confirmed Node Stewards with addresses/placement locations.
- 1 scheduled field test date before the builder ships them any hardware advice beyond the public docs.

This prevents "spreadsheet chapters"—cities with a web page and zero nodes.

### What the Early-Access List Becomes
The current signup form (clipboard/mailto/postJson) is a **pre-commitment list**, not a newsletter.

**Segmentation:**
- **Interested Neighbor** (Eiber/Denver): Invite to first field test. Offer Node Steward role.
- **Remote Supporter** (outside Denver): Added to a **Chapter Waitlist**. When 5 people exist in the same metro, they are introduced to each other and offered the Chapter Lead / Replication Kit.
- **Technical Contributor** (checks a "I can code" box): Invited to the GitHub org to contribute to the Go bridge or provisioning tools.

**Communication cadence:** One email per month maximum. Content: field test recap, coverage map update, hardware BOM price changes. No startup buzzword newsletters.

### Zero-Dollar Marketing Stack
1. **GitHub as SEO:** The repo's `README.md` is the top of funnel. It should contain the words "neighborhood mesh network," "emergency communication," and "Meshtastic tutorial" because that is what people search.
2. **Field Test Content:** Every Mesh Walk produces a photo, a coverage map, and a short write-up. Post to r/meshtastic, r/preppers, r/homelab, and the Denver subreddit. Authentic field data gets upvoted; promotional posts get banned.
3. **Meshtastic Community Integration:** Contribute range-test data back to the Meshtastic project. Be a good citizen. The community reciprocates with visibility.
4. **Local News Hook:** When the Eiber mesh hits 10 nodes, pitch a story to Colorado Community Media or Westword: "This Lakewood neighborhood built its own internet-free text network." Local news loves tactile, visual, civic-tech stories.

---

## 6. TPM PORTFOLIO FRAMING

This project is not just a cool mesh network—it is a **program management case study** in constrained execution. Frame it for TPM interviews around three axes:

### Talking Point 1: Scope Management Under Extreme Constraint
> "I was a solo builder with 1.5 hours per day and a July 7 hard ship date. I had to decide between a mobile app, a web dashboard, and a CLI tool. I chose the CLI + Go bridge because they validated the core risk—can we actually observe mesh health programmatically?—fastest. A mobile app would have been a second frontend to build; a web dashboard without working data is theater. I documented the decision in an ADR (Architecture Decision Record) in the repo. This is the same tradeoff I would make on a platform team: ship the integration point before the consumer experience."

**Extracted PM skill:** Ruthless prioritization using risk-reduction as the primary sorting function.

### Talking Point 2: Vendor & Supply Chain Agility
> "My hardware BOM has three tiers: the Heltec V3 at $20 for handsets, the V4 at $25 for solar repeaters, and the Pi Zero 2 W at $15 for gateways. I picked these not because they are the best on every axis, but because they balance availability, community support, and price. When the Pi Zero 2 W had stockouts in early 2026, I had already mapped the fallback to Pi 3 A+ with a documented power-budget delta. On a platform team, this maps directly to multi-source vendor strategies and BOM resilience planning."

**Extracted PM skill:** Supply-chain risk mitigation and fallback planning in hardware-software programs.

### Talking Point 3: Stakeholder Alignment Without Authority
> "I am not a Ham radio operator, a city employee, or an HOA board member. I cannot command anyone to put a node on their roof. So I designed the Node Steward Agreement—a one-page document that makes expectations explicit—and the field test event, which gives participants a tangible win (a coverage map, a CSV file, a photo) in two hours. This is the same stakeholder management model I would use for a cross-functional platform migration: give every participant a clear role, a clear artifact, and a clear timeline, and you do not need org-chart authority to ship."

**Extracted PM skill:** Influencing without authority through clear role definition and rapid value demonstration.

---

## 7. RISKS & OPEN QUESTIONS

### Top 5 Technical Risks

| Rank | Risk | Likelihood | Impact | Mitigation |
|------|------|------------|--------|------------|
| 1 | **Urban range is too short for Eiber topology.** Suburban Denver lots with mature trees and single-story homes may force nodes closer than 0.5 miles. | Medium | High | Pre-survey with Meshtastic Site Planner (site.meshtastic.org). Budget for 8 nodes instead of 6. Recruit a steward on a 2nd-story or roof-access home. |
| 2 | **Pi Zero 2 W RAM exhaustion.** Running `meshtasticd` + Go bridge + Python CLI + potential future web server on 512 MB may cause OOM kills. | Medium | Medium | Set up swap file. Monitor with `vmstat`. Have Pi 3 A+ fallback documented. Offload web dashboard to Cloudflare Pages (static) instead of Pi-hosted. |
| 3 | **Meshtastic firmware breaking change.** The project ships firmware updates that can change protobuf schemas or TCP behavior. | Medium | High | Pin firmware version in docs. Subscribe to Meshtastic firmware release notes. Test beta releases in a non-production node before rolling to gateway. |
| 4 | **Solar power fails in winter.** Colorado December has short days and snow. A 2W panel may not keep a repeater alive through a week of storms. | Medium | Medium | Size battery for 7-day autonomy minimum (3000 mAh + low-power V4/Stick Lite). Build a "winter mode" config with longer sleep intervals. |
| 5 | **Scaling past ~50 nodes per channel causes congestion.** Meshtastic rebroadcasts all packets. Dense meshes with high traffic can saturate the channel. | Low (for pilot) | High (for growth) | Design channel isolation early (neighborhood channel vs. events channel). Document this as a known Meshtastic limitation, not a Faulty Link bug. |

### Top 5 Community/Adoption Risks

| Rank | Risk | Likelihood | Impact | Mitigation |
|------|------|------------|--------|------------|
| 1 | **Cannot recruit 3 Node Stewards in Eiber.** Without roof-access nodes, the mesh is just a few desk toys. | Medium | Critical | Expand search radius to 2 miles. Lower bar: window-sill nodes count. Offer to install everything personally—zero steward effort. |
| 2 | **Participants expect "internet replacement."** Meshtastic is 220-char text only. A neighbor expecting Instagram will churn immediately. | High | Medium | Brutally honest messaging on the site: "This is emergency text and telemetry. Not the internet." Set expectations before the first field test. |
| 3 | **Builder burnout at 1.5 hrs/day.** Solo operators die by a thousand micro-tasks. | Medium | High | Protect the 1.5 hrs with rigid focus: Mon/Wed/Fri = software, Tue/Thu = community/hardware. Say no to feature requests outside Phase 1 until July 7. |
| 4 | **Chapter Leads ghost after getting the Replication Kit.** | Medium | Medium | Gate chapter creation behind the "3 stewards + 1 field test date" rule. Do not hand out the kit to individuals—only to groups that have already self-organized. |
| 5 | **Legal/regulatory FUD.** A neighbor or HOA board worries that 915 MHz LoRa is "illegal" or "surveillance." | Low | Medium | Prepare a one-pager: "Meshtastic operates under FCC Part 15 rules. No license required. All traffic is AES-encrypted by default. We cannot read your messages." |

### Top 3 Questions to Answer by End of Denver Pilot

1. **What is the real node-to-node range in Eiber's specific suburban environment?** Not a generic "0.5-2 miles" guess, but a plotted map with RSSI/SNR data at specific distances and elevations. This determines whether the Phase 3 hardware BOM should budget for 6 nodes or 12 per neighborhood.

2. **Can a non-technical Node Steward keep a solar node alive for 90 days?** If the answer is no, the entire Phase 3 vision of "deployable by non-technical organizers" collapses. The pilot must test whether "set and forget" is real or a fantasy.

3. **Does the mesh provide value on a "blue-sky day," or only in emergencies?** If nodes only get powered on during field tests, the network is an event, not infrastructure. The pilot must surface at least one "organic" use case—a lost dog alert, a block party coordination, a parent checking if a kid made it to the park—without the builder prompting it.

---

*End of Plan*
