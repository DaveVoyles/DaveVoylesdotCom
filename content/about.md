+++
title = "About"
layout = "about"
url = "/about/"
description = "Former Senior Technical Program Manager at Xbox/Microsoft — builder-first TPM bridging deep tech, agent orchestration, and platform delivery from Philadelphia."
ShowToc = false
hideMeta = true
hideReadingTime = true

# ---------------------------------------------------------------------------
# Portfolio About data model (static first; WebGL constellation can bind to
# the same constellation.* fields later without rewriting copy).
# Claim safety: numbers and authorship claims must stay aligned with
# resume-builder-Dave/docs/candidate-profile.md + accuracy-and-claims.md.
# ---------------------------------------------------------------------------

[about]
badge = "TPM / BUILDER"
headline = "Hi, I'm Dave."
headline_accent = "I bridge deep tech with execution rigor."
lede = "Former Senior Technical Program Manager at Xbox/Microsoft. I spent years shipping platform systems at scale — and now I build the agent fleets that help engineering work get done under real controls."
location = "Philadelphia, PA · Remote-US"
photo = "/images/posts/Dave_Debbie.jpeg"
photo_alt = "Dave Voyles"
focus = "Builder-first TPM / agent platform work — production systems with real controls, not demo-only chatbots."
building = "Agent fleets on a Dockerized homelab, evidence-backed resume tooling, sports tech (Philly Lax + CFB playbooks), and head coach at Harriton lacrosse."

[[about.ctas]]
label = "LinkedIn"
url = "https://www.linkedin.com/in/davevoyles/"
primary = true

[[about.ctas]]
label = "GitHub"
url = "https://github.com/davevoyles"
primary = false

[[about.tech]]
name = "Azure"

[[about.tech]]
name = "Docker"

[[about.tech]]
name = "GitHub"

[[about.tech]]
name = "Xbox"

[[about.tech]]
name = "Multi-LLM"

[[about.tech]]
name = "MCP"

[[about.stats]]
value = "10+"
label = "Years at Microsoft"
detail = "Xbox, CSE, DX/DPE, Reactor"

[[about.stats]]
value = "$50M"
label = "Platform modernization"
detail = "Xbox 360 commerce retirement, zero downtime"

[[about.stats]]
value = "20+"
label = "Docker containers"
detail = "Production homelab, agent-operated"

[[about.stats]]
value = "12h → 30m"
label = "Publishing SLA"
detail = "Xbox game package pipeline re-architecture"

# Primary skill block — owns the section
[about.skills_primary]
title = "AI Agents & Orchestration"
subtitle = "Primary focus"
cluster = "agents"
pills = [
  "Multi-agent systems",
  "LLM routing",
  "Tool-calling skills",
  "Orchestration workflows",
  "MCP",
  "Production evals",
  "RAG / knowledge systems",
  "Agent-governed CI",
]

# Supporting strip — deliberately smaller than a full column
[about.skills_web]
title = "Web"
subtitle = "Supporting"
cluster = "web"
pills = [
  "Web platforms",
  "Hugo / static sites",
  "PWAs",
  "JavaScript",
  "REST & webhooks",
  "Dashboards",
  "WebGL / data viz",
]

[[about.skills_secondary]]
title = "Program & Platform Leadership"
cluster = "program"
pills = [
  "Cross-team delivery",
  "Critical path & risk",
  "API migrations",
  "Xbox / commerce platforms",
  "Exec alignment",
  "SLA performance",
]

[[about.skills_secondary]]
title = "Production Systems"
cluster = "production"
pills = [
  "Docker",
  "Container ops (agent-driven)",
  "Azure",
  "Homelab ops",
  "Observability",
  "Python",
]

[[about.impact]]
title = "Xbox commerce & publishing"
summary = "Led high-stakes platform programs across 12+ engineering groups — including a legacy commerce retirement protecting ~$50M annual revenue and a publishing pipeline re-architecture that cut publish time from 12 hours to a 30-minute target."
tags = ["Xbox", "Platform", "SLA"]
cluster = "program"

[[about.impact]]
title = "Agentic engineering platforms"
summary = "Extend and operate multi-agent production systems: multi-LLM routing, tool-calling skill fleets, captain/crew orchestration, MCP interfaces, and evaluation gates — running on a Dockerized 20+ container homelab I operate myself."
tags = ["Agents", "Docker", "Orchestration"]
cluster = "agents"

[[about.impact]]
title = "Public work & web platforms"
summary = "Conference talks (BUILD, GDC, XDC), the UnrealScript Game Programming Cookbook, a co-invented patent, and production web platforms for the Philadelphia lacrosse community — including WebGL playbook viz and offline PWAs."
tags = ["Speaking", "Web", "WebGL"]
cluster = "web"

[about.approach]
title = "My approach"
tagline = "Engineering → Rigor → Execution → Impact"
steps = [
  "Build — on an active homelab and real production systems",
  "Align — stakeholders, engineers, and executives around one outcome",
  "Deliver — against high-scale platform work with clear critical paths",
  "Optimize — for SLA performance, efficiency, and reversible process",
]

[about.footer]
line = "Proud to call Philadelphia home. Builder first — TPM by craft."
linkedin = "https://www.linkedin.com/in/davevoyles/"
github = "https://github.com/davevoyles"

# Constellation topology — rendered as interactive SVG today; same ids/clusters
# are the hand-off surface for a future Three.js / WebGL scene.
# Intent: this is a map of Dave's *personal agent/container production system*
# (orchestrator, agents, Docker host, gates) — NOT a career timeline, org chart,
# or generic skills mind-map. Labels should stay system-shaped so visitors read
# it as "how my agent fleet works," not "what jobs I've held."
[about.constellation]
title = "My agent production system"
subtitle = "A map of how I run multi-agent work in production — not a résumé timeline. Click a node for what it does; hover a skill pill to highlight a layer. Keys 1–4 filter clusters; Esc clears. Drag to orbit in WebGL."

[[about.constellation.nodes]]
id = "orchestrator"
label = "Orchestrator"
cluster = "agents"
x = 50
y = 42
detail = "Captain of the fleet: takes a work order, assigns planner/coder/search agents, and holds the critical path until eval gates pass or a human is needed."

[[about.constellation.nodes]]
id = "planner"
label = "Planner"
cluster = "agents"
x = 28
y = 28
detail = "Breaks ambiguous goals into sequenced, verifiable tasks — sizes work, names dependencies, and refuses to hand the coder a vague ticket."

[[about.constellation.nodes]]
id = "coder"
label = "Coder"
cluster = "agents"
x = 72
y = 28
detail = "Implements changes in isolated worktrees: write code, run tests, open PRs. Never the merge authority — that lives downstream in eval + human approval."

[[about.constellation.nodes]]
id = "search"
label = "Search"
cluster = "agents"
x = 22
y = 52
detail = "Retrieval across wiki, code, and docs (BM25 + vectors + tools). Read-first before inventing; cites sources so claims stay grounded."

[[about.constellation.nodes]]
id = "router"
label = "LLM router"
cluster = "agents"
x = 50
y = 22
detail = "Routes each request to the right model or agent for cost, latency, and capability — multi-LLM by design, not a single-vendor chat box."

[[about.constellation.nodes]]
id = "skills"
label = "Skills / tools"
cluster = "agents"
x = 78
y = 48
detail = "Versioned tool-calling skills (plan, TDD, review, deploy patterns). The fleet’s shared craft library — how work is done, not just which model answers."

[[about.constellation.nodes]]
id = "eval"
label = "Eval gates"
cluster = "agents"
x = 50
y = 62
detail = "Automated checks before merge: tests, lint, claim safety, policy gates. Fail-closed on destructive or ambiguous work; green is not optional theater."

[[about.constellation.nodes]]
id = "mcp"
label = "MCP"
cluster = "agents"
x = 65
y = 58
detail = "Model Context Protocol interfaces — structured tools so agents share one contract for vault search, boards, and external systems instead of ad-hoc scrapes."

[[about.constellation.nodes]]
id = "docker"
label = "Docker host"
cluster = "production"
x = 18
y = 72
detail = "20+ containers on the homelab host: agents, runners, media, dashboards. Agent-operated container ops with hardened defaults (capabilities dropped, networks scoped)."

[[about.constellation.nodes]]
id = "azure"
label = "Azure / ADO"
cluster = "production"
x = 38
y = 78
detail = "Cloud and delivery surface: Azure services plus GitHub/ADO-style pipelines. Where platform work leaves the laptop and meets real SLAs."

[[about.constellation.nodes]]
id = "dashboard"
label = "Dashboards"
cluster = "web"
x = 82
y = 72
detail = "Status UIs and observability — what’s running, what’s blocked, what merged. Web is the control surface, not the product identity."

[[about.constellation.nodes]]
id = "human"
label = "Human approval"
cluster = "program"
x = 50
y = 88
detail = "Hard stop for irreversible or high-risk actions. Autonomy is earned; I still own the merge button when the blast radius is real."

[[about.constellation.edges]]
from = "router"
to = "orchestrator"

[[about.constellation.edges]]
from = "orchestrator"
to = "planner"

[[about.constellation.edges]]
from = "orchestrator"
to = "coder"

[[about.constellation.edges]]
from = "orchestrator"
to = "search"

[[about.constellation.edges]]
from = "orchestrator"
to = "skills"

[[about.constellation.edges]]
from = "coder"
to = "skills"

[[about.constellation.edges]]
from = "skills"
to = "mcp"

[[about.constellation.edges]]
from = "orchestrator"
to = "eval"

[[about.constellation.edges]]
from = "eval"
to = "human"

[[about.constellation.edges]]
from = "orchestrator"
to = "docker"

[[about.constellation.edges]]
from = "docker"
to = "azure"

[[about.constellation.edges]]
from = "eval"
to = "dashboard"

[[about.constellation.edges]]
from = "azure"
to = "dashboard"
+++

<!-- Body intentionally empty: the `about` layout renders from front matter.
     Keep any freeform notes here only if you need a markdown overflow later. -->
