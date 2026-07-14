/*
 * DDIA Interactive — course content.
 *
 * Everything the app renders lives in this data structure, so adding a new
 * chapter later means appending an object to `chapters` (and, if needed, a new
 * part). No engine code has to change.
 *
 * Block types understood by the renderer (js/app.js):
 *   { type: "lead",    text }                     – large intro paragraph
 *   { type: "p",       text }                      – body paragraph (inline `code` and *emphasis* allowed)
 *   { type: "h",       text }                      – sub-heading inside a section
 *   { type: "term",    word, def }                 – key-term definition card
 *   { type: "callout", variant, title, text }      – variant: "insight" | "warning" | "practice" | "story"
 *   { type: "list",    ordered, items:[...] }      – bullet / numbered list
 *   { type: "code",    lang, code }                – code / query block
 *   { type: "figure",  render, caption }           – render is a key into js/diagrams.js
 *   { type: "check",   ...quizQuestion }           – inline knowledge check (single question)
 *
 * A quiz question object:
 *   { q, options:[...], answer:<index>, why }      – `why` explains the correct answer
 */
window.DDIA_CONTENT = {
  book: {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    subtitle: "The big ideas behind reliable, scalable, and maintainable systems",
  },

  parts: [
    {
      id: "part1",
      label: "Part I",
      title: "Foundations of Data Systems",
      blurb:
        "The fundamental ideas that apply to all data systems — whether running on one machine or a cluster of thousands.",
      chapters: [
        {
          id: "ch1",
          number: 1,
          title: "Reliable, Scalable & Maintainable Applications",
          summary:
            "The three concerns that shape almost every system you'll build: keeping it working when things break, keeping it fast as it grows, and keeping it pleasant to work on over years.",
          estMinutes: 55,
          epigraph: {
            quote:
              "The Internet was done so well that most people think of it as a natural resource like the Pacific Ocean, rather than something that was man-made. When was the last time a technology with a scale like that was so error-free?",
            source: "Alan Kay, Dr Dobb's Journal (2012)",
          },

          sections: [
            /* ---------------------------------------------------------- */
            {
              id: "thinking",
              title: "Thinking About Data Systems",
              icon: "layers",
              estMinutes: 10,
              blocks: [
                {
                  type: "lead",
                  text:
                    "Modern apps are *data-intensive*, not *compute-intensive*. Raw CPU is rarely the limit — the hard problems are the **amount** of data, the **complexity** of data, and the **speed** at which it changes.",
                },
                {
                  type: "p",
                  text:
                    "A data-intensive application is assembled from standard building blocks. You reach for them without thinking, because they're such a successful abstraction:",
                },
                {
                  type: "list",
                  ordered: false,
                  items: [
                    "Store data so it can be found again later — **databases**",
                    "Remember the result of an expensive operation to speed up reads — **caches**",
                    "Let users search by keyword or filter — **search indexes**",
                    "Send a message to another process, handled asynchronously — **stream processing**",
                    "Periodically crunch a large accumulated dataset — **batch processing**",
                  ],
                },
                {
                  type: "h",
                  text: "Why lump them together as \"data systems\"?",
                },
                {
                  type: "p",
                  text:
                    "A database and a message queue look superficially similar — both store data for a while — but they have very different access patterns and implementations. So why one umbrella term? Two reasons.",
                },
                {
                  type: "list",
                  ordered: true,
                  items: [
                    "The categories are **blurring**. Redis is a datastore that's also used as a message queue; Kafka is a message queue with database-like durability guarantees.",
                    "One tool often **can't do everything** anymore. Work gets broken into tasks handled by specialized tools, stitched together with application code.",
                  ],
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "You become a system designer",
                  text:
                    "The moment you combine a cache, a search index and a database behind one API, you've built a new special-purpose data system. Its clients now rely on guarantees you provide — e.g. that the cache is invalidated correctly on writes. You're no longer just an application developer.",
                },
                {
                  type: "figure",
                  render: "dataSystem",
                  caption:
                    "Figure 1-1. One possible architecture for a data system that combines several components behind a single API.",
                },
                {
                  type: "p",
                  text:
                    "Designing such a system raises tricky questions: How do you keep data correct even when things go wrong internally? How do you give clients good performance even when parts are degraded? How do you scale for more load? This book focuses on **three concerns** that matter in most systems:",
                },
                {
                  type: "term",
                  word: "Reliability",
                  def:
                    "The system keeps working *correctly* (right function, right performance) even in the face of adversity — hardware faults, software faults, and human error.",
                },
                {
                  type: "term",
                  word: "Scalability",
                  def:
                    "As the system grows — in data volume, traffic, or complexity — there are reasonable ways of dealing with that growth.",
                },
                {
                  type: "term",
                  word: "Maintainability",
                  def:
                    "Over time many different people work on the system, and they can all do so *productively*.",
                },
                {
                  type: "check",
                  q:
                    "You put Redis in front of Postgres as a cache and expose one API. A teammate says \"we're just using a cache.\" Per Kleppmann, what's the more accurate framing?",
                  options: [
                    "It's still just a cache; nothing has really changed.",
                    "You've designed a new composite data system, and clients now depend on guarantees you must uphold (like correct cache invalidation).",
                    "Redis and Postgres are the same category of tool, so it doesn't matter.",
                    "Caches remove the need to think about the database.",
                  ],
                  answer: 1,
                  why:
                    "Combining general-purpose tools behind one interface creates a new special-purpose data system. The guarantees (e.g. consistent, correctly-invalidated results) are now yours to design and uphold.",
                },
              ],
            },

            /* ---------------------------------------------------------- */
            {
              id: "reliability",
              title: "Reliability",
              icon: "shield",
              estMinutes: 14,
              blocks: [
                {
                  type: "lead",
                  text:
                    "Reliability means, roughly: *continuing to work correctly, even when things go wrong.* The things that go wrong are called **faults**; a system that anticipates and copes with them is **fault-tolerant** or **resilient**.",
                },
                {
                  type: "callout",
                  variant: "warning",
                  title: "Fault ≠ failure",
                  text:
                    "A fault is one component deviating from its spec. A failure is the system as a whole stopping to provide the service to the user. You can't drive the probability of faults to zero, so you design fault-tolerance mechanisms that stop faults from becoming failures.",
                },
                {
                  type: "p",
                  text:
                    "Counter-intuitively, it can make sense to *increase* the rate of faults deliberately — randomly killing processes without warning. Many critical bugs come from poor error handling; by continuously exercising the fault-tolerance machinery you gain confidence it works. Netflix's **Chaos Monkey** is the classic example.",
                },
                {
                  type: "h",
                  text: "1. Hardware faults",
                },
                {
                  type: "p",
                  text:
                    "Disks crash, RAM goes faulty, someone unplugs the wrong cable. Hard disks have a mean-time-to-failure (MTTF) of ~10–50 years, so on a cluster of **10,000 disks you should expect one to die per day.** The classic response is redundancy: RAID, dual power supplies, hot-swappable CPUs, backup generators.",
                },
                {
                  type: "p",
                  text:
                    "But as data volumes grow, more apps use more machines, which increases the rate of hardware faults. Cloud platforms like AWS prioritize elasticity, so VM instances can become unavailable without warning. The trend is toward **software fault-tolerance** that can survive whole-machine loss — which also allows rolling restarts with no downtime.",
                },
                {
                  type: "h",
                  text: "2. Software errors",
                },
                {
                  type: "p",
                  text:
                    "Hardware faults are mostly random and independent. Software faults are **systematic and correlated** — a bug triggered by a specific input can crash every node at once. Examples: the June 30 2012 leap-second Linux kernel bug that hung many apps simultaneously; a runaway process exhausting a shared resource; cascading failures.",
                },
                {
                  type: "p",
                  text:
                    "There's no quick fix. What helps: carefully checking assumptions, thorough testing, process isolation, allowing crash-and-restart, and measuring/monitoring behavior in production. If a system should hold an invariant (e.g. messages-in equals messages-out), it can constantly check itself and raise an alert on a discrepancy.",
                },
                {
                  type: "h",
                  text: "3. Human errors",
                },
                {
                  type: "callout",
                  variant: "story",
                  title: "Humans are the leading cause",
                  text:
                    "One study of large internet services found configuration errors by operators were the leading cause of outages — hardware faults played a role in only 10–25% of outages.",
                },
                {
                  type: "p",
                  text: "The best systems combine several approaches to be reliable despite unreliable humans:",
                },
                {
                  type: "list",
                  ordered: false,
                  items: [
                    "**Minimize opportunities for error** — well-designed abstractions and APIs make the right thing easy and the wrong thing hard (but not so restrictive people route around them).",
                    "**Decouple** where people make mistakes from where they cause failures — provide full-featured *sandbox* environments with real data but no real users.",
                    "**Test thoroughly** at all levels — unit, integration, and manual, especially for corner cases.",
                    "**Allow quick recovery** — fast config rollback, gradual rollouts, tools to recompute data.",
                    "**Set up clear monitoring** — performance metrics and error rates (telemetry) to catch problems and violated assumptions early.",
                  ],
                },
                {
                  type: "callout",
                  variant: "practice",
                  title: "In practice",
                  text:
                    "Reliability isn't just for nuclear plants. A bug that corrupts a parent's photos, or an hour of e-commerce downtime, has real cost. You may consciously sacrifice reliability to cut development cost for an unproven prototype — but be conscious of when you're cutting corners.",
                },
                {
                  type: "check",
                  q:
                    "Your service depends on a fault-tolerance failover path that has never actually run in production. Which practice from the chapter most directly builds confidence it works?",
                  options: [
                    "Add more redundant hardware.",
                    "Deliberately induce faults in production (e.g. Chaos Monkey) to continuously exercise the failover.",
                    "Write more documentation about the failover.",
                    "Increase the MTTF of the disks.",
                  ],
                  answer: 1,
                  why:
                    "Untested recovery paths tend to fail when finally needed. Deliberately triggering faults keeps the fault-tolerance machinery continuously exercised, surfacing the poor-error-handling bugs that cause most critical failures.",
                },
                {
                  type: "check",
                  q:
                    "Why does the book call software faults more dangerous than hardware faults in large systems?",
                  options: [
                    "Software faults are always caused by bad programmers.",
                    "Hardware is more expensive to replace.",
                    "Hardware faults are usually random and independent, while software faults are systematic and correlated — they can take down every node at once.",
                    "Software never fails if you test it enough.",
                  ],
                  answer: 2,
                  why:
                    "Independent hardware failures are unlikely to hit many machines simultaneously. A systematic software bug (a bad input, a leap-second) is correlated across nodes and can fail them all together.",
                },
              ],
            },

            /* ---------------------------------------------------------- */
            {
              id: "scalability",
              title: "Scalability",
              icon: "trending",
              estMinutes: 18,
              blocks: [
                {
                  type: "lead",
                  text:
                    "Scalability describes a system's ability to cope with *increased load.* It is **not** a one-dimensional label — \"X is scalable\" is meaningless. The real question: *if the system grows in a particular way, what are our options for coping?*",
                },
                {
                  type: "h",
                  text: "Describing load",
                },
                {
                  type: "p",
                  text:
                    "First describe the current load with **load parameters** — the right numbers depend on your architecture: requests/sec to a web server, read/write ratio in a database, active users in a chat room, cache hit rate. Sometimes the average matters; sometimes a few extreme cases dominate.",
                },
                {
                  type: "callout",
                  variant: "story",
                  title: "Twitter's real bottleneck: fan-out",
                  text:
                    "Post tweet: ~4.6k requests/sec average (12k at peak). Home timeline: ~300k requests/sec. Handling 12k writes/sec is easy. The challenge is fan-out — each user follows many people and is followed by many people.",
                },
                {
                  type: "p",
                  text: "Twitter considered two approaches to serving the home timeline:",
                },
                {
                  type: "list",
                  ordered: true,
                  items: [
                    "**Read-time merge:** store tweets in a global collection; on timeline read, look up everyone you follow and merge their recent tweets (sorted). Cheap writes, expensive reads.",
                    "**Write-time fan-out:** keep a cache (\"mailbox\") per user's timeline; when someone tweets, insert it into every follower's cache. Cheap reads, expensive writes.",
                  ],
                },
                {
                  type: "figure",
                  render: "fanout",
                  caption:
                    "Figure 1-3. Approach 2 fans a tweet out to every follower's timeline cache at write time, so reads are cheap.",
                },
                {
                  type: "p",
                  text:
                    "Twitter moved from approach 1 to approach 2, because timeline **reads vastly outnumber writes** (~two orders of magnitude) — better to do more work at write time. But a tweet is delivered to ~75 followers on average, turning 4.6k tweets/sec into **345k writes/sec** to caches. And the distribution is skewed: a celebrity with 30M+ followers means one tweet fans out to 30M+ writes, which is hard to do within Twitter's 5-second delivery target.",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "The load parameter that matters",
                  text:
                    "For Twitter, the distribution of followers per user (weighted by tweet rate) is the key load parameter, because it drives the fan-out load. The final design is a hybrid: fan out normal users at write time, but fetch celebrity tweets at read time and merge.",
                },
                {
                  type: "h",
                  text: "Describing performance",
                },
                {
                  type: "p",
                  text:
                    "Once load is described, ask: (a) if you increase a load parameter and keep resources fixed, how is performance affected? (b) to keep performance unchanged, how much must you increase resources? In batch systems (Hadoop) we care about **throughput** (records/sec). In online systems, **response time** — the time between a client sending a request and receiving a response — usually matters more.",
                },
                {
                  type: "term",
                  word: "Latency vs response time",
                  def:
                    "They're not synonyms. Response time is what the client sees: service time + network delays + queueing delays. Latency is the duration a request is waiting to be handled — latent, awaiting service.",
                },
                {
                  type: "p",
                  text:
                    "Response time varies request-to-request, so treat it as a **distribution, not a single number.** Most requests are fast, but there are *outliers*. Random extra latency can come from a context switch, a lost network packet + TCP retransmit, a garbage-collection pause, or a page fault forcing a disk read.",
                },
                {
                  type: "callout",
                  variant: "warning",
                  title: "The average lies — use percentiles",
                  text:
                    "The mean doesn't tell you how many users actually experienced a delay. Use the median (p50): half of requests are faster, half slower. To see outliers, look at tail percentiles: p95, p99, p999. If p95 = 1.5s, then 5% of requests take 1.5s or more.",
                },
                {
                  type: "figure",
                  render: "percentiles",
                  caption:
                    "Figure 1-4. Response times for 100 requests: the mean hides the tail. p50, p95, p99 tell the real story.",
                },
                {
                  type: "p",
                  text:
                    "**Tail latencies matter directly to users.** Amazon describes internal response-time targets at the p99.9 — even though it affects only 1 in 1,000 requests — because the slowest requests often belong to customers with the most data, i.e. the most valuable ones. Amazon found a 100ms increase in response time reduced sales by 1%. But optimizing p99.99 was deemed too expensive for too little benefit.",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "Head-of-line blocking & tail amplification",
                  text:
                    "A server handles only a few requests in parallel, so a handful of slow requests can hold up everything behind them (head-of-line blocking) — measure on the client side. And when one user request needs multiple backend calls, it's only as fast as the slowest call, so a small fraction of slow backend calls makes a large fraction of user requests slow (tail latency amplification).",
                },
                {
                  type: "h",
                  text: "Approaches for coping with load",
                },
                {
                  type: "p",
                  text:
                    "An architecture good for one level of load rarely handles 10× that load. On a fast-growing service you'll likely rethink your architecture on every order-of-magnitude increase.",
                },
                {
                  type: "list",
                  ordered: false,
                  items: [
                    "**Scale up (vertical):** move to a more powerful machine. Simpler, but high-end machines get very expensive.",
                    "**Scale out (horizontal):** distribute load across many smaller machines — a *shared-nothing* architecture. Good architectures usually mix both pragmatically.",
                    "**Elastic** systems add resources automatically on load increase; others are scaled manually (simpler, fewer surprises).",
                  ],
                },
                {
                  type: "callout",
                  variant: "warning",
                  title: "There is no magic scaling sauce",
                  text:
                    "The architecture of a system at large scale is highly specific to the application — the problem may be read volume, write volume, data volume, complexity, response-time requirements, or (usually) a mix. A system for 100k requests/sec of 1kB each looks nothing like one for 3 requests/min of 2GB each, even at the same throughput. Scalable architectures are built around assumptions about which operations are common and which are rare.",
                },
                {
                  type: "check",
                  q:
                    "Your dashboard reports an average API response time of 120ms and leadership is happy. Why might Kleppmann be worried anyway?",
                  options: [
                    "The average is too low to be believable.",
                    "The mean hides the tail — the p99/p999 users (often your most valuable, data-heavy customers) may be experiencing multi-second responses.",
                    "You should always report the maximum instead.",
                    "Averages are only valid for batch systems.",
                  ],
                  answer: 1,
                  why:
                    "The mean says nothing about how many users experienced a delay. Tail percentiles (p95/p99/p999) reveal the outliers, and those slow requests often hit the highest-value customers.",
                },
                {
                  type: "check",
                  q:
                    "Twitter switched from read-time merge (approach 1) to write-time fan-out (approach 2). What made that the right trade-off?",
                  options: [
                    "Writes are much more frequent than reads.",
                    "Reads (timeline views) vastly outnumber writes (tweets), so doing more work at write time makes the common read cheap.",
                    "Fan-out uses less total storage.",
                    "Approach 2 removes the need for any caching.",
                  ],
                  answer: 1,
                  why:
                    "Timeline reads outnumber tweet writes by ~two orders of magnitude. Precomputing timelines at write time makes the far-more-common read cheap — though celebrity fan-out forces a hybrid design.",
                },
              ],
            },

            /* ---------------------------------------------------------- */
            {
              id: "maintainability",
              title: "Maintainability",
              icon: "wrench",
              estMinutes: 12,
              blocks: [
                {
                  type: "lead",
                  text:
                    "The majority of the cost of software is **not** initial development — it's ongoing maintenance: fixing bugs, keeping it operational, investigating failures, adapting to new platforms, repaying technical debt, adding features.",
                },
                {
                  type: "p",
                  text:
                    "We can design software to minimize the pain of maintenance — and avoid creating legacy software ourselves — by attending to three design principles:",
                },
                {
                  type: "term",
                  word: "Operability",
                  def: "Make it easy for operations teams to keep the system running smoothly.",
                },
                {
                  type: "term",
                  word: "Simplicity",
                  def:
                    "Make it easy for new engineers to understand the system, by removing as much complexity as possible. (Not the same as simplicity of the user interface.)",
                },
                {
                  type: "term",
                  word: "Evolvability",
                  def:
                    "Make it easy for engineers to change the system in future, adapting it for unanticipated use cases. Also called extensibility, modifiability, or plasticity.",
                },
                {
                  type: "h",
                  text: "Operability: making life easy for operations",
                },
                {
                  type: "p",
                  text:
                    "\"Good operations can often work around the limitations of bad software, but good software cannot run reliably with bad operations.\" Good data systems make routine tasks easy: good visibility/monitoring into runtime behavior, support for automation, avoiding dependency on individual machines, good documentation and an easy-to-understand operational model, sensible defaults with the freedom to override, self-healing where appropriate, and predictable behavior.",
                },
                {
                  type: "h",
                  text: "Simplicity: managing complexity",
                },
                {
                  type: "p",
                  text:
                    "Small projects can be delightfully simple; as they grow they often become a *big ball of mud.* Symptoms of complexity: explosion of state space, tight coupling of modules, tangled dependencies, inconsistent naming, hacks to solve performance problems, special-casing. Complexity slows everyone down and raises the risk of bugs.",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "Accidental complexity & abstraction",
                  text:
                    "Complexity is *accidental* if it's not inherent in the problem the software solves (as seen by users) but arises only from the implementation. The best tool for removing accidental complexity is a good abstraction — it hides implementation detail behind a clean façade, is reusable, and improves quality for everything built on it (SQL, high-level languages). But finding good abstractions is hard.",
                },
                {
                  type: "h",
                  text: "Evolvability: making change easy",
                },
                {
                  type: "p",
                  text:
                    "Your requirements will not stay unchanged forever — you learn new facts, new use cases emerge, priorities shift, platforms change, laws change. Agile working patterns (TDD, refactoring) provide a framework for adapting to change, usually discussed at a small local scale. The ease of modifying a system is closely linked to its simplicity and its abstractions — so the book uses **evolvability** to refer to agility at the data-system level.",
                },
                {
                  type: "check",
                  q:
                    "A codebase compiles and passes tests, but new hires take weeks to make a small change because modules are tightly coupled and full of special-cases. Which maintainability principle is most violated?",
                  options: [
                    "Operability",
                    "Simplicity — accidental complexity (tight coupling, special-casing) makes the system hard to understand and change.",
                    "Reliability",
                    "Scalability",
                  ],
                  answer: 1,
                  why:
                    "Tangled dependencies and special-casing are hallmarks of accidental complexity — the target of the Simplicity principle. Good abstractions are the main tool for removing it.",
                },
              ],
            },
          ],

          /* ---------------- End-of-chapter evaluation ---------------- */
          evaluation: {
            title: "Chapter 1 Evaluation",
            passPct: 70,
            intro:
              "Twelve questions across all four sections. Score 70% or higher to mark the chapter complete. Every question explains its answer so a miss is still a lesson.",
            questions: [
              {
                q: "What distinguishes a data-intensive application from a compute-intensive one?",
                options: [
                  "It uses more expensive CPUs.",
                  "Its primary challenges are the amount, complexity, and rate-of-change of data — not raw CPU power.",
                  "It never uses caches or search indexes.",
                  "It runs only on a single machine.",
                ],
                answer: 1,
                why:
                  "Data-intensive means data is the primary challenge (volume, complexity, velocity); compute-intensive means CPU cycles are the bottleneck.",
              },
              {
                q: "Reliability is best summarized as…",
                options: [
                  "Never having any faults.",
                  "Continuing to work correctly even when things go wrong.",
                  "Having the fastest possible response time.",
                  "Running on redundant hardware only.",
                ],
                answer: 1,
                why: "Faults are inevitable; reliability is tolerating them so they don't become failures.",
              },
              {
                q: "What is the difference between a fault and a failure?",
                options: [
                  "They are the same thing.",
                  "A fault is a whole-system outage; a failure is one broken component.",
                  "A fault is one component deviating from spec; a failure is the whole system no longer serving the user.",
                  "A failure only happens in hardware; a fault only in software.",
                ],
                answer: 2,
                why:
                  "Fault-tolerance is about preventing faults (component-level deviations) from cascading into failures (system-level loss of service).",
              },
              {
                q: "Why can it make sense to deliberately trigger faults in production (e.g. Chaos Monkey)?",
                options: [
                  "To reduce the number of servers needed.",
                  "To continuously exercise fault-tolerance machinery and surface poor error handling before a real incident.",
                  "To increase throughput.",
                  "It never makes sense.",
                ],
                answer: 1,
                why:
                  "Many critical bugs are in rarely-run recovery paths; exercising them constantly builds confidence they work when needed.",
              },
              {
                q: "Compared to hardware faults, software faults are dangerous mainly because they are…",
                options: [
                  "Random and independent.",
                  "Always caused by disk failure.",
                  "Systematic and correlated — capable of taking down every node at once.",
                  "Impossible to monitor.",
                ],
                answer: 2,
                why:
                  "A systematic bug (bad input, leap-second) hits all nodes together, unlike mostly-independent hardware failures.",
              },
              {
                q: "According to the study cited, the leading cause of outages in large internet services was…",
                options: [
                  "Hardware faults (servers/network).",
                  "Configuration errors made by operators (human error).",
                  "Cosmic rays.",
                  "Power grid failures.",
                ],
                answer: 1,
                why: "Operator configuration errors led; hardware faults played a role in only 10–25% of outages.",
              },
              {
                q: "\"Scalability\" is best treated as…",
                options: [
                  "A yes/no label you attach to a system.",
                  "A question: if load grows in a particular way, what are our options for coping?",
                  "Synonymous with using more servers.",
                  "A property only of batch systems.",
                ],
                answer: 1,
                why:
                  "Saying 'X is scalable' is meaningless; scalability is about coping strategies for specific kinds of growth (load parameters).",
              },
              {
                q: "What was Twitter's real scaling challenge?",
                options: [
                  "The raw volume of tweet writes (~12k/sec at peak).",
                  "Fan-out: each user follows and is followed by many people, so delivering timelines is the hard part.",
                  "Running out of usernames.",
                  "The size of individual tweets.",
                ],
                answer: 1,
                why:
                  "12k writes/sec is easy; the fan-out to followers' timelines (up to 30M+ for celebrities) is the challenge, driving the hybrid design.",
              },
              {
                q: "Why prefer percentiles (p95/p99) over the mean for response times?",
                options: [
                  "The mean is harder to compute.",
                  "Percentiles reveal the tail — how many users actually experienced slow requests — which the mean hides.",
                  "The mean is only valid for less than 100 requests.",
                  "Percentiles are always smaller numbers.",
                ],
                answer: 1,
                why:
                  "Response time is a distribution; tail percentiles expose the outliers (often the most valuable customers) that the average obscures.",
              },
              {
                q: "\"Tail latency amplification\" describes the effect where…",
                options: [
                  "Averages grow over time.",
                  "One user request that fans out to many backend calls is only as fast as the slowest call, so a few slow backends make many user requests slow.",
                  "Latency and response time are synonyms.",
                  "Adding servers always reduces the p50.",
                ],
                answer: 1,
                why:
                  "When a request needs multiple backend calls, the slowest dominates — so even a small fraction of slow calls slows a large fraction of end-user requests.",
              },
              {
                q: "Which statement about coping with load is TRUE per the chapter?",
                options: [
                  "There is a generic one-size-fits-all scalable architecture (\"magic scaling sauce\").",
                  "Scaling up (vertical) is always better than scaling out.",
                  "Large-scale architectures are highly application-specific, built around assumptions about which operations are common vs rare.",
                  "Elastic systems are always preferable to manually-scaled ones.",
                ],
                answer: 2,
                why:
                  "There's no magic scaling sauce; good architecture is specific to the app's load profile and its assumptions about common vs rare operations.",
              },
              {
                q: "The three design principles of maintainability are…",
                options: [
                  "Speed, cost, and security.",
                  "Operability, simplicity, and evolvability.",
                  "Redundancy, sharding, and caching.",
                  "Testing, logging, and deployment.",
                ],
                answer: 1,
                why:
                  "Operability (easy to operate), Simplicity (easy to understand, removing accidental complexity), Evolvability (easy to change).",
              },
            ],
          },
        },
      ],
    },
  ],
};
