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

        /* ============================ CHAPTER 2 ============================ */
        {
          id: "ch2",
          number: 2,
          title: "Data Models & Query Languages",
          summary:
            "Data models are the deepest choice you make — they shape not just your code, but how you think about the problem. Relational, document, and graph, and the languages that query them.",
          estMinutes: 52,
          status: "ready",
          epigraph: {
            quote: "The limits of my language mean the limits of my world.",
            source: "Ludwig Wittgenstein, Tractatus Logico-Philosophicus (1922)",
          },
          sections: [
            {
              id: "relational-document",
              title: "Relational vs. Document",
              icon: "layers",
              estMinutes: 15,
              blocks: [
                {
                  type: "lead",
                  text:
                    "Data models are perhaps *the* most important part of building software — they shape how the software is written, and how we think about the problem. Most apps are built by layering one data model on top of another.",
                },
                {
                  type: "p",
                  text:
                    "The dominant model is **SQL / the relational model** (Codd, 1970): data organized into *relations* (tables) of unordered *tuples* (rows). It won so completely that we forget it once had rivals. **NoSQL** rose in the 2010s driven by a need for greater scale, a preference for free/open-source, specialized queries relational SQL handles poorly, and frustration with the rigid relational schema.",
                },
                {
                  type: "h",
                  text: "The object-relational mismatch",
                },
                {
                  type: "p",
                  text:
                    "Most application code is object-oriented, so working with a relational database needs an awkward translation layer (ORMs). This disconnect is called an **impedance mismatch**. A résumé — one person with many jobs and many education entries — is naturally a *one-to-many tree*, which a single JSON **document** captures with good locality.",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "Documents fit trees",
                  text:
                    "For self-contained one-to-many tree data (a résumé, an invoice, a blog post with comments), a JSON document has better locality and less impedance mismatch than shredding it across many relational tables — you load the whole thing in one read.",
                },
                {
                  type: "h",
                  text: "Many-to-one and many-to-many",
                },
                {
                  type: "p",
                  text:
                    "**Normalization** stores human-meaningful info in exactly one place and refers to it by an ID that never needs to change (so no risk of some copies going stale). But this needs *many-to-one* relationships (many people live in one region), which don't fit the document model well — document DBs have weak **join** support. And as an app grows, data tends to become more interconnected: add recommendations, or make organizations their own entities, and you have *many-to-many* relationships.",
                },
                {
                  type: "callout",
                  variant: "warning",
                  title: "Joins don't vanish — they move",
                  text:
                    "If your database can't do joins, you emulate them in application code with multiple queries. The work doesn't disappear — it moves into your app, adds complexity, and is usually slower than a join running inside the database.",
                },
                {
                  type: "h",
                  text: "Schema-on-read vs. schema-on-write",
                },
                {
                  type: "p",
                  text:
                    "Document DBs are often called *schemaless*, but that's misleading — the code reading the data still assumes *some* structure. There's an **implicit** schema; it's just not enforced by the database. Better terms: **schema-on-read** (structure is interpreted only when data is read — like dynamic/run-time typing) vs **schema-on-write** (the relational way — schema is explicit and the DB enforces it — like static/compile-time typing).",
                },
                {
                  type: "code",
                  lang: "js",
                  code:
                    "// schema-on-read: just start writing the new shape,\n// and handle old documents in code at read time\nif (user && user.name && !user.first_name) {\n  user.first_name = user.name.split(\" \")[0];\n}\n\n-- schema-on-write: migrate the table up front\nALTER TABLE users ADD COLUMN first_name text;\nUPDATE users SET first_name = split_part(name, ' ', 1);",
                },
                {
                  type: "p",
                  text:
                    "Schema-on-read shines when data is **heterogeneous** (many object types, or a structure dictated by external systems you don't control). Schema-on-write is valuable when all records share a structure worth documenting and enforcing.",
                },
                {
                  type: "h",
                  text: "Data locality",
                },
                {
                  type: "p",
                  text:
                    "A document is stored as one contiguous blob (JSON/BSON). That's a **locality** win if you often need the whole document at once — but wasteful if you only need a piece, because the DB must load the entire document, and any update usually rewrites the whole thing. So keep documents small. Locality isn't unique to documents — Google Spanner and Bigtable's column-families provide it inside relational models too.",
                },
                {
                  type: "check",
                  q:
                    "Your app stores blog posts, each with its list of comments and tags, and almost always loads a whole post at once with no cross-post relationships. Which model does the chapter favor, and why?",
                  options: [
                    "Relational — it's always the safe default.",
                    "Document — the data is a self-contained one-to-many tree, so a single document gives better locality and less impedance mismatch.",
                    "Graph — all data should be a graph.",
                    "It makes no difference at all.",
                  ],
                  answer: 1,
                  why:
                    "Tree-shaped, self-contained one-to-many data loaded whole is exactly where documents excel: one read, good locality, no shredding across tables.",
                },
                {
                  type: "check",
                  q:
                    "A teammate calls MongoDB \"schemaless.\" What's the more precise framing from the chapter?",
                  options: [
                    "It's correct — there is genuinely no schema anywhere.",
                    "There's still an implicit schema the reading code assumes; it's schema-on-read (enforced by the app, not the DB) rather than schema-on-write.",
                    "Documents can never change shape.",
                    "Schemas only exist in graph databases.",
                  ],
                  answer: 1,
                  why:
                    "'Schemaless' hides that the reader assumes structure. The distinction is where/when the schema is enforced: on read (implicit, in app code) vs on write (explicit, by the DB).",
                },
              ],
            },
            {
              id: "great-debate",
              title: "The Great Debate (a history lesson)",
              icon: "history",
              estMinutes: 11,
              blocks: [
                {
                  type: "lead",
                  text:
                    "Today's relational-vs-document argument is a rerun. The same fight played out in the 1970s — and the reasons one side won are still the reasons that matter.",
                },
                {
                  type: "p",
                  text:
                    "IBM's **IMS** (1968, built for the Apollo program) used the **hierarchical model**: data as a tree of records nested within records — remarkably like JSON. It was great for one-to-many, bad at many-to-many, and had no joins. Sound familiar? Developers had to either duplicate (denormalize) data or manually chase references.",
                },
                {
                  type: "p",
                  text:
                    "Two solutions competed to fix it: the **network (CODASYL) model** and the **relational model**.",
                },
                {
                  type: "term",
                  word: "Network / CODASYL model",
                  def:
                    "A record can have multiple parents; links are like pointers on disk. The only way to reach a record is to follow an **access path** — the programmer manually navigates an n-dimensional space. Efficient on 1970s hardware, but the query code was complex and inflexible.",
                },
                {
                  type: "term",
                  word: "Relational model",
                  def:
                    "Lay all the data out in the open — a table is just a collection of rows, no labyrinthine access paths. A **query optimizer** decides the access paths automatically; to query a new way you just declare an index. Build the optimizer once, and every app benefits.",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "The idea that won",
                  text:
                    "The relational model moved the burden of choosing access paths from the developer to the query optimizer. Document DBs reverted to the hierarchical model for nested one-to-many data — but for many-to-many, relational and document DBs use the *same* trick: reference by unique ID (a foreign key / document reference), resolved at read time.",
                },
                {
                  type: "check",
                  q:
                    "In the network (CODASYL) model, who chose the access path to reach a record — and what changed with the relational model?",
                  options: [
                    "The DBA chose it; relational moved it to the network admin.",
                    "The application programmer navigated access paths manually; the relational model handed that job to an automatic query optimizer.",
                    "Nobody chose paths in either model.",
                    "The relational model removed indexes entirely.",
                  ],
                  answer: 1,
                  why:
                    "CODASYL required hand-coded, hard-to-change access paths. The relational model's key advance was a reusable optimizer that picks paths automatically, so apps adapt easily.",
                },
              ],
            },
            {
              id: "query-languages",
              title: "Query Languages: declarative vs. imperative",
              icon: "code",
              estMinutes: 13,
              blocks: [
                {
                  type: "lead",
                  text:
                    "SQL didn't just introduce a data model — it introduced a new *way to ask*: a **declarative** language. IMS and CODASYL queried with **imperative** code.",
                },
                {
                  type: "p",
                  text:
                    "Imperative code tells the computer the exact steps: loop, test, push, repeat. A declarative language (SQL, relational algebra) specifies only the *pattern* of data you want — the conditions, sorting, grouping — not *how* to fetch it. The optimizer chooses indexes and join order.",
                },
                {
                  type: "code",
                  lang: "js",
                  code:
                    "// imperative: you spell out every step\nfunction getSharks() {\n  var sharks = [];\n  for (var i = 0; i < animals.length; i++) {\n    if (animals[i].family === \"Sharks\") sharks.push(animals[i]);\n  }\n  return sharks;\n}\n\n-- declarative: you state what you want\nSELECT * FROM animals WHERE family = 'Sharks';",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "Why declarative wins",
                  text:
                    "It's more concise, and — crucially — it hides the engine's internals. The database can add a new index, reorder joins, or run the query in **parallel across CPU cores** without you changing a single line. Imperative code, bound to a specific order, can't be parallelized safely because the DB can't tell whether you depend on that order.",
                },
                {
                  type: "p",
                  text:
                    "This advantage isn't limited to databases. In a browser, **CSS** and **XPath** are declarative: `li.selected > p { background: blue }` just describes the pattern. Doing the same by imperatively walking the DOM in JavaScript is longer, more brittle (it won't un-highlight when the class is removed), and can't be optimized by the browser.",
                },
                {
                  type: "h",
                  text: "MapReduce — somewhere in between",
                },
                {
                  type: "p",
                  text:
                    "**MapReduce** (popularized by Google) processes bulk data across many machines using *map* and *reduce* functions — snippets of code the framework calls repeatedly. It's neither fully declarative nor fully imperative. The functions must be **pure** (no side effects, no extra queries), so the framework can run them anywhere, in any order, and safely retry them on failure.",
                },
                {
                  type: "callout",
                  variant: "story",
                  title: "NoSQL accidentally reinvents SQL",
                  text:
                    "Writing two carefully-coordinated JavaScript functions is harder than writing one query, and gives the optimizer less to work with. So MongoDB later added a declarative **aggregation pipeline** — JSON syntax, but expressively a subset of SQL. The moral: a NoSQL system may find itself accidentally reinventing SQL, in disguise.",
                },
                {
                  type: "check",
                  q:
                    "Why can a declarative SQL query get faster on new hardware without you rewriting it, while equivalent imperative code often can't?",
                  options: [
                    "SQL is compiled and imperative code is not.",
                    "Declarative queries state only the desired result, so the engine is free to change indexes, join order, and use parallel execution; imperative code fixes an execution order the engine must preserve.",
                    "Imperative code is always buggier.",
                    "SQL never touches the disk.",
                  ],
                  answer: 1,
                  why:
                    "By specifying *what*, not *how*, declarative queries leave the engine room to optimize and parallelize. Imperative steps pin down an order the engine can't safely rearrange.",
                },
              ],
            },
            {
              id: "graph-models",
              title: "Graph Data Models",
              icon: "graph",
              estMinutes: 13,
              blocks: [
                {
                  type: "lead",
                  text:
                    "When many-to-many relationships dominate and data is highly interconnected, it becomes natural to model data as a **graph**: *vertices* (nodes) connected by *edges* (relationships).",
                },
                {
                  type: "p",
                  text:
                    "Familiar examples: social graphs (people / who-knows-whom), the web graph (pages / links), road networks (junctions / roads). Classic algorithms run on them — shortest path for routing, PageRank for ranking. Graphs also store *heterogeneous* data: Facebook keeps a single graph whose vertices are people, locations, events, check-ins, and comments.",
                },
                {
                  type: "term",
                  word: "Property graph",
                  def:
                    "Each vertex has a unique id, a set of properties (key-values), and sets of incoming and outgoing edges. Each edge has an id, a tail vertex, a head vertex, a label (the kind of relationship), and properties. Any vertex can connect to any other — which makes graphs superb for evolvability as your app grows.",
                },
                {
                  type: "code",
                  lang: "cypher",
                  code:
                    "-- Cypher: create edges with an arrow notation\nCREATE\n  (USA:Location   {name:'United States', type:'country'}),\n  (Idaho:Location {name:'Idaho', type:'state'}),\n  (Lucy:Person    {name:'Lucy'}),\n  (Idaho)-[:WITHIN]->(USA),\n  (Lucy)-[:BORN_IN]->(Idaho)\n\n-- find people who emigrated from the US to Europe\nMATCH\n  (p) -[:BORN_IN]->  () -[:WITHIN*0..]-> (:Location {name:'United States'}),\n  (p) -[:LIVES_IN]-> () -[:WITHIN*0..]-> (:Location {name:'Europe'})\nRETURN p.name   -- :WITHIN*0.. means \"follow WITHIN zero or more times\"",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "Same query: 4 lines vs. 29",
                  text:
                    "That US→Europe query is 4 lines in Cypher but ~29 lines of SQL using a recursive common table expression (WITH RECURSIVE), because the number of joins (levels of location nesting) isn't known in advance. Different data models suit different data — for highly interconnected data, graphs are the most natural fit.",
                },
                {
                  type: "p",
                  text:
                    "**Triple-stores** express the same idea as `(subject, predicate, object)` — e.g. `(lucy, marriedTo, alain)`. **SPARQL** is their query language (it predates and inspired Cypher). **Datalog**, older still, is the foundation both build on. All are declarative graph query languages.",
                },
                {
                  type: "check",
                  q:
                    "You're modeling a dataset where any entity might relate to any other in ways you can't fully predict, and you'll keep adding new relationship types. Which model does the chapter call most natural?",
                  options: [
                    "The document model — nest everything.",
                    "A graph model — any vertex can link to any other, and it extends cleanly as new relationship types appear.",
                    "A single wide relational table.",
                    "MapReduce.",
                  ],
                  answer: 1,
                  why:
                    "Graphs impose no restriction on which vertices connect, so they adapt as relationships grow and diversify — ideal for highly interconnected, evolving data.",
                },
              ],
            },
          ],
          evaluation: {
            title: "Chapter 2 Evaluation",
            passPct: 70,
            intro:
              "Ten questions across relational, document, and graph models plus query languages. Score 70% or higher to complete the chapter.",
            questions: [
              {
                q: "The awkward translation between object-oriented application code and the relational model is called…",
                options: ["Normalization", "The impedance mismatch", "Schema-on-read", "Fan-out"],
                answer: 1,
                why: "ORMs exist to bridge the impedance mismatch between objects and relations.",
              },
              {
                q: "The document model has the best locality for which kind of data?",
                options: [
                  "Highly interconnected many-to-many data.",
                  "Self-contained one-to-many tree data usually loaded as a whole.",
                  "Data with no structure at all.",
                  "Time-series analytics.",
                ],
                answer: 1,
                why: "One read fetches the whole tree; shredding it across tables would need many lookups.",
              },
              {
                q: "The main downside of the document model for many-to-many relationships is…",
                options: [
                  "Documents can't store numbers.",
                  "Weak join support, so you emulate joins in app code (more complexity, usually slower).",
                  "It requires a schema up front.",
                  "It can't be indexed.",
                ],
                answer: 1,
                why: "Without DB joins, the join work moves into application code via multiple queries.",
              },
              {
                q: "\"Schema-on-read\" is most analogous to…",
                options: [
                  "Static (compile-time) type checking.",
                  "Dynamic (run-time) type checking.",
                  "Manual memory management.",
                  "Two-phase commit.",
                ],
                answer: 1,
                why: "Structure is interpreted when data is read, like dynamic typing; schema-on-write is like static typing.",
              },
              {
                q: "IBM's IMS used the hierarchical model, which most resembles…",
                options: [
                  "The graph model.",
                  "The JSON/document model — nested records forming a tree.",
                  "Column-oriented storage.",
                  "The relational model.",
                ],
                answer: 1,
                why: "The 1968 hierarchical model nested records in a tree, strikingly like today's JSON documents.",
              },
              {
                q: "The relational model's key advantage over CODASYL was…",
                options: [
                  "It used less disk.",
                  "A query optimizer chooses access paths automatically, instead of the programmer hand-coding them.",
                  "It removed the need for keys.",
                  "It forbade many-to-many relationships.",
                ],
                answer: 1,
                why: "Build the optimizer once; every application benefits and can adapt queries without rewriting navigation code.",
              },
              {
                q: "A declarative query language (like SQL) beats an imperative API mainly because it…",
                options: [
                  "Runs only on one machine.",
                  "Hides execution details, so the engine can optimize, add indexes, and parallelize without query changes.",
                  "Is always shorter to type.",
                  "Guarantees a fixed row order.",
                ],
                answer: 1,
                why: "Stating *what*, not *how*, gives the engine freedom to optimize and parallelize across cores.",
              },
              {
                q: "MapReduce's map and reduce functions must be pure. Why?",
                options: [
                  "To make them run slower.",
                  "So the framework can run them anywhere, in any order, and safely retry on failure.",
                  "Because JavaScript requires it.",
                  "To enforce a schema.",
                ],
                answer: 1,
                why: "No side effects and no extra queries means the functions are safely relocatable and re-runnable.",
              },
              {
                q: "In a property graph, an edge carries all of the following EXCEPT…",
                options: [
                  "A tail vertex and a head vertex.",
                  "A label describing the relationship.",
                  "A fixed maximum number of allowed vertices in the whole graph.",
                  "Its own set of properties.",
                ],
                answer: 2,
                why: "Edges have tail/head vertices, a label, and properties; graphs impose no global vertex limit.",
              },
              {
                q: "For highly interconnected data with unpredictable, growing relationship types, the most natural model is…",
                options: ["Document", "Graph", "A single wide table", "Key-value with a hash index"],
                answer: 1,
                why: "Graphs let any vertex connect to any other and extend cleanly, ideal for evolving interconnected data.",
              },
            ],
          },
        },

        /* ============================ CHAPTER 3 ============================ */
        {
          id: "ch3",
          number: 3,
          title: "Storage & Retrieval",
          summary:
            "How databases actually store data on disk and get it back fast — logs, hash indexes, LSM-trees, B-trees — and why analytics needs a completely different layout: column-oriented storage.",
          estMinutes: 50,
          status: "ready",
          epigraph: {
            quote:
              "Wer Ordnung hält, ist nur zu faul zum Suchen. (If you keep things tidily ordered, you're just too lazy to go searching.)",
            source: "German proverb",
          },
          sections: [
            {
              id: "logs-indexes",
              title: "The simplest database: logs & indexes",
              icon: "db",
              estMinutes: 12,
              blocks: [
                {
                  type: "lead",
                  text:
                    "At its core a database does two things: store the data you give it, and give it back when you ask. The world's simplest database is two shell functions appending to a text file.",
                },
                {
                  type: "code",
                  lang: "bash",
                  code:
                    "db_set () { echo \"$1,$2\" >> database; }      # append key,value\ndb_get () { grep \"^$1,\" database | sed -e \"s/^$1,//\" | tail -n 1; }",
                },
                {
                  type: "p",
                  text:
                    "`db_set` is fast — appending to a file is about the cheapest thing a computer can do. But `db_get` is **O(n)**: it scans the entire file. To read efficiently we need an **index** — an additional structure *derived* from the primary data. And here's the fundamental trade-off of storage engines:",
                },
                {
                  type: "callout",
                  variant: "warning",
                  title: "The index trade-off",
                  text:
                    "A well-chosen index speeds up reads — but every index *slows down writes*, because each write must also update the index. This is why databases don't index everything by default: you, knowing the query patterns, choose the indexes worth their write cost.",
                },
                {
                  type: "h",
                  text: "Hash indexes",
                },
                {
                  type: "p",
                  text:
                    "Keep an in-memory hash map: each key → the byte offset of its value in the file. On write, append the value and update the map; on read, look up the offset and seek straight to it. This is essentially how **Bitcask** (the default engine in Riak) works — excellent when you have many writes but the set of *distinct* keys fits in memory.",
                },
                {
                  type: "p",
                  text:
                    "Append-only means the file grows forever. The fix: break the log into **segments** and **compact** them — throw away duplicate keys, keeping only the latest value for each — merging segments in a background thread.",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "Why append-only is surprisingly fast",
                  text:
                    "Appending and merging segments are *sequential* writes — dramatically faster than random writes on both spinning disks and SSDs. Immutable segments also make concurrency and crash recovery far simpler: you never leave a half-overwritten value behind.",
                },
                {
                  type: "p",
                  text:
                    "But hash indexes have two hard limits: the hash table must fit in **memory**, and **range queries** are inefficient (you can't scan `key0001`–`key9999` without probing each one). That motivates the next design.",
                },
                {
                  type: "check",
                  q:
                    "Your write-heavy service suddenly slows down after you add three new indexes to a table. What's the most likely explanation from the chapter?",
                  options: [
                    "Indexes always speed everything up; something else is wrong.",
                    "Each index must be updated on every write, so more indexes mean slower writes — the classic read/write trade-off.",
                    "Indexes only affect deletes.",
                    "The disk ran out of range queries.",
                  ],
                  answer: 1,
                  why:
                    "Indexes accelerate reads at the cost of writes; adding indexes adds per-write update work. Index only what your queries justify.",
                },
              ],
            },
            {
              id: "lsm-btree",
              title: "SSTables, LSM-Trees & B-Trees",
              icon: "tree",
              estMinutes: 14,
              blocks: [
                {
                  type: "lead",
                  text:
                    "Two families of storage engine power almost every database you'll meet: **LSM-trees** (log-structured) and **B-trees** (the classic).",
                },
                {
                  type: "h",
                  text: "SSTables and LSM-Trees",
                },
                {
                  type: "p",
                  text:
                    "Require each segment's key-value pairs to be **sorted by key** — a *Sorted String Table* (SSTable). Sorting buys three things: merging segments is efficient (a mergesort of sorted files), you no longer need every key in memory (a **sparse** index is enough — find the nearest indexed key and scan), and you can group records into blocks and compress them.",
                },
                {
                  type: "p",
                  text:
                    "How do you keep writes sorted when they arrive in random order? Buffer them in an in-memory balanced tree — the **memtable**. When it grows past a threshold, flush it to disk as a new SSTable. Reads check the memtable, then the newest segment, then older ones; background **compaction** merges segments continuously. This is an **LSM-tree** (Log-Structured Merge-tree) — behind LevelDB, RocksDB, Cassandra, and HBase. A **Bloom filter** avoids wasted disk lookups for keys that don't exist.",
                },
                {
                  type: "h",
                  text: "B-Trees",
                },
                {
                  type: "p",
                  text:
                    "The most widely used index — the default in nearly every relational database. B-trees break the database into fixed-size **pages** (~4 KB), read and written one page at a time, arranged as a balanced tree you descend by key. Unlike LSM's append-only style, B-trees **overwrite pages in place**. To stay crash-safe mid-write, they first record changes in a **write-ahead log (WAL)** so a crash can be recovered.",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "LSM vs. B-tree: the trade-off",
                  text:
                    "LSM-trees are usually faster for **writes** (sequential I/O, higher write throughput, better compression, smaller files). B-trees are usually faster and more predictable for **reads** (each key lives in exactly one place, so no checking multiple segments). LSM's background compaction can occasionally interfere with live requests, hurting tail latency. There's no universal winner — match the engine to your workload and measure.",
                },
                {
                  type: "check",
                  q:
                    "In an LSM-tree, what keeps incoming writes sorted even though they arrive in random key order?",
                  options: [
                    "The write-ahead log.",
                    "An in-memory balanced tree (the memtable) that is flushed to disk as a sorted SSTable once it's large enough.",
                    "The Bloom filter.",
                    "The query optimizer.",
                  ],
                  answer: 1,
                  why:
                    "Writes buffer in the memtable (kept sorted in memory); when it's full it's written out as an already-sorted SSTable segment.",
                },
                {
                  type: "check",
                  q:
                    "A B-tree overwrites pages in place. What mechanism lets it survive a crash that happens halfway through a page write?",
                  options: [
                    "A Bloom filter.",
                    "The write-ahead log (WAL) / redo log, which records changes first so recovery can replay them.",
                    "Compaction.",
                    "The memtable.",
                  ],
                  answer: 1,
                  why:
                    "Because in-place overwrites can be interrupted, B-trees write intended changes to a WAL first, enabling consistent recovery after a crash.",
                },
              ],
            },
            {
              id: "oltp-olap",
              title: "OLTP vs. OLAP & the Data Warehouse",
              icon: "trending",
              estMinutes: 11,
              blocks: [
                {
                  type: "lead",
                  text:
                    "Two very different access patterns need two very different storage designs — even when both speak SQL.",
                },
                {
                  type: "term",
                  word: "OLTP — transaction processing",
                  def:
                    "User-facing apps: fetch a small number of records by key, plus low-latency reads and writes. Bottlenecked by disk seeks. Example: look up one customer's order.",
                },
                {
                  type: "term",
                  word: "OLAP — analytics",
                  def:
                    "Business intelligence: scan huge numbers of records, read only a few columns, compute aggregates (sum, count, avg). Bottlenecked by disk bandwidth. Example: total revenue per region last quarter.",
                },
                {
                  type: "p",
                  text:
                    "Running heavy analytic scans on the live OLTP database would wreck user-facing latency, so companies copy data into a separate, read-optimized **data warehouse**, populated by **ETL** (Extract → Transform → Load). Analysts hammer the warehouse without touching production.",
                },
                {
                  type: "p",
                  text:
                    "Warehouses typically use a **star schema**: a central **fact table** with one row per event (a sale, a click, a page view), surrounded by **dimension tables** (product, customer, date, store) referenced by foreign keys — the *who / what / where / when / how* of each event. A **snowflake** schema breaks dimensions down further into sub-dimensions.",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "Same SQL, opposite engine",
                  text:
                    "OLTP and OLAP systems may both accept SQL, but under the hood they are built completely differently. That difference in physical storage is exactly what the next section is about.",
                },
                {
                  type: "check",
                  q:
                    "Why do organizations run analytics against a separate data warehouse instead of the production OLTP database?",
                  options: [
                    "Warehouses are cheaper to license.",
                    "Big analytic scans would compete with and degrade the low-latency reads/writes users depend on, so analytics gets its own read-optimized copy.",
                    "OLTP databases can't run SQL.",
                    "ETL is required by law.",
                  ],
                  answer: 1,
                  why:
                    "Analytics scans huge datasets; running that on live OLTP harms user-facing performance. A warehouse isolates and optimizes for that workload.",
                },
              ],
            },
            {
              id: "column-storage",
              title: "Column-Oriented Storage",
              icon: "columns",
              estMinutes: 13,
              blocks: [
                {
                  type: "lead",
                  text:
                    "Fact tables can hold trillions of rows and hundreds of columns — yet a typical analytic query reads only 4 or 5 of those columns. Row-oriented storage forces the engine to load *every* column of every row it scans. Column storage flips this on its head.",
                },
                {
                  type: "figure",
                  render: "rowVsColumn",
                  caption:
                    "Row-oriented stores whole rows together; column-oriented stores each column's values together — so a query touching a few columns reads only those.",
                },
                {
                  type: "p",
                  text:
                    "Store all the values of **each column together** in its own file, rather than all values of each row. Now a query over 5 columns reads only those 5 columns' files — an enormous reduction in I/O over reading every column of every row.",
                },
                {
                  type: "callout",
                  variant: "insight",
                  title: "Columns compress beautifully",
                  text:
                    "Values within a single column are similar and repetitive, so they compress extremely well (e.g. **bitmap encoding** of distinct values). Less data on disk means less bandwidth to read and more data fitting in CPU cache — enabling fast **vectorized** processing over tight loops.",
                },
                {
                  type: "p",
                  text:
                    "You can also **sort** rows by a chosen column, which speeds range filters and boosts compression further; a warehouse may even store the same data sorted several different ways for redundancy. Writes get harder (you can't cheaply insert into the middle of a sorted column) — but the **LSM-tree** approach solves it: buffer writes in memory, then merge them into the column files in bulk.",
                },
                {
                  type: "p",
                  text:
                    "Finally, since the same aggregates get computed over and over, warehouses precompute them as a **materialized view** or a **data cube** (a grid of aggregates across dimensions) — making dashboards feel instant, at the cost of some flexibility.",
                },
                {
                  type: "check",
                  q:
                    "An analytics query sums one column across a 200-column, billion-row fact table. Why is column-oriented storage dramatically faster here?",
                  options: [
                    "It uses a faster CPU.",
                    "It reads only the file(s) for the column(s) the query needs, instead of loading all 200 columns of every row.",
                    "It avoids SQL entirely.",
                    "It stores less data overall by deleting rows.",
                  ],
                  answer: 1,
                  why:
                    "Column storage lets the engine read just the referenced columns, slashing I/O compared with row storage that must pull every column of each scanned row.",
                },
                {
                  type: "check",
                  q:
                    "Why does data in a single column compress so much better than a whole row?",
                  options: [
                    "Columns are stored encrypted.",
                    "Values in one column are of the same type and highly repetitive/similar, so encodings like bitmap compression shrink them a lot.",
                    "Rows contain no data.",
                    "Compression only works on integers.",
                  ],
                  answer: 1,
                  why:
                    "Homogeneous, repetitive column values compress far better than a heterogeneous row, cutting disk bandwidth and improving cache use.",
                },
              ],
            },
          ],
          evaluation: {
            title: "Chapter 3 Evaluation",
            passPct: 70,
            intro:
              "Eleven questions on storage engines and analytical storage. Score 70% or higher to complete the chapter.",
            questions: [
              {
                q: "The fundamental trade-off that an index introduces is…",
                options: [
                  "It speeds up both reads and writes.",
                  "It speeds up reads but slows down writes.",
                  "It slows reads but speeds writes.",
                  "It has no effect on performance.",
                ],
                answer: 1,
                why: "Every index must be maintained on each write, trading write cost for faster reads.",
              },
              {
                q: "Bitcask-style hash indexes struggle with…",
                options: [
                  "Point lookups by key.",
                  "Keeping all keys in memory and doing efficient range queries.",
                  "Sequential writes.",
                  "Crash recovery.",
                ],
                answer: 1,
                why: "The hash map must fit in RAM, and hashes give no ordering, so range scans are inefficient.",
              },
              {
                q: "Why are append-only logs and segment merges fast on real hardware?",
                options: [
                  "They avoid using the disk.",
                  "They are sequential writes, which are much faster than random writes on disks and SSDs, and immutability simplifies concurrency/recovery.",
                  "They compress everything to zero.",
                  "They never need compaction.",
                ],
                answer: 1,
                why: "Sequential I/O dominates random I/O in throughput, and immutable segments ease concurrency and crash recovery.",
              },
              {
                q: "An SSTable requires that its key-value pairs are…",
                options: ["Encrypted", "Sorted by key", "Stored in insertion order", "All in memory"],
                answer: 1,
                why: "Sorted keys enable efficient merging, sparse in-memory indexes, and block compression.",
              },
              {
                q: "In an LSM-tree, writes are first buffered in…",
                options: [
                  "A B-tree page.",
                  "An in-memory balanced tree called the memtable, later flushed as a sorted SSTable.",
                  "The write-ahead log only.",
                  "A materialized view.",
                ],
                answer: 1,
                why: "The memtable keeps recent writes sorted in memory until it's flushed to disk as an SSTable.",
              },
              {
                q: "A Bloom filter in an LSM-tree helps by…",
                options: [
                  "Sorting the data.",
                  "Quickly telling you a key is definitely NOT present, avoiding pointless disk reads across segments.",
                  "Compressing columns.",
                  "Replacing the WAL.",
                ],
                answer: 1,
                why: "Bloom filters cheaply rule out absent keys, saving disk lookups on reads that would find nothing.",
              },
              {
                q: "B-trees differ from LSM-trees primarily because they…",
                options: [
                  "Never use a log.",
                  "Overwrite fixed-size pages in place (and use a write-ahead log for crash safety), rather than appending immutable segments.",
                  "Store data unsorted.",
                  "Only work in memory.",
                ],
                answer: 1,
                why: "B-trees update pages in place; a WAL makes those in-place overwrites crash-safe.",
              },
              {
                q: "Which best contrasts OLTP and OLAP?",
                options: [
                  "OLTP scans everything; OLAP fetches one row.",
                  "OLTP fetches a few records by key with low latency; OLAP scans many records over a few columns to compute aggregates.",
                  "They are identical.",
                  "OLAP is for writes, OLTP is for reads.",
                ],
                answer: 1,
                why: "OLTP = seek-bound key lookups for apps; OLAP = bandwidth-bound scans for analytics.",
              },
              {
                q: "In a star schema, the central table with one row per event is the…",
                options: ["Dimension table", "Fact table", "Materialized view", "Segment"],
                answer: 1,
                why: "The fact table holds events; dimension tables (product, date, customer…) describe them.",
              },
              {
                q: "Column-oriented storage speeds analytics mainly because…",
                options: [
                  "It deletes old rows.",
                  "It reads only the columns a query references, instead of every column of every scanned row.",
                  "It disables indexing.",
                  "It stores rows twice.",
                ],
                answer: 1,
                why: "Storing columns separately lets the engine read just the needed columns, cutting I/O massively.",
              },
              {
                q: "Precomputing common aggregates as a materialized view or data cube trades…",
                options: [
                  "Correctness for speed.",
                  "Flexibility for speed — dashboards get instant answers but the precomputed grid is less flexible than ad-hoc queries.",
                  "Nothing; it's free.",
                  "Storage for nothing.",
                ],
                answer: 1,
                why: "Materialized aggregates make repeated queries instant but are less flexible than computing from raw data each time.",
              },
            ],
          },
        },

        /* Not yet authored — shown as \"coming\" in the listing. */
        {
          id: "ch4",
          number: 4,
          title: "Encoding and Evolution",
          summary:
            "How data is encoded for storage and over the wire (JSON, Protocol Buffers, Avro, Thrift), and how schemas evolve so old and new code can coexist during rolling upgrades.",
          status: "coming",
          sections: [],
        },
      ],
    },

    /* ======================= PART II (coming) ======================= */
    {
      id: "part2",
      label: "Part II",
      title: "Distributed Data",
      blurb:
        "What happens when data no longer fits — or shouldn't live — on a single machine: replication, partitioning, transactions, and the hard truths of distributed systems.",
      chapters: [
        {
          id: "ch5",
          number: 5,
          title: "Replication",
          summary:
            "Keeping copies of data on multiple nodes: single-leader, multi-leader, and leaderless replication, and the thorny problem of replication lag.",
          status: "coming",
          sections: [],
        },
        {
          id: "ch6",
          number: 6,
          title: "Partitioning",
          summary:
            "Splitting a large dataset across nodes (sharding): partitioning by key range or hash, secondary indexes, rebalancing, and request routing.",
          status: "coming",
          sections: [],
        },
        {
          id: "ch7",
          number: 7,
          title: "Transactions",
          summary:
            "The slippery concept of ACID, weak isolation levels, race conditions, and serializability — what transactions really guarantee.",
          status: "coming",
          sections: [],
        },
        {
          id: "ch8",
          number: 8,
          title: "The Trouble with Distributed Systems",
          summary:
            "Unreliable networks, unreliable clocks, and process pauses — the partial failures that make distributed systems genuinely hard.",
          status: "coming",
          sections: [],
        },
        {
          id: "ch9",
          number: 9,
          title: "Consistency and Consensus",
          summary:
            "Linearizability, ordering guarantees, and consensus — how nodes can agree despite faults, and the costs of doing so.",
          status: "coming",
          sections: [],
        },
      ],
    },

    /* ======================= PART III (coming) ======================= */
    {
      id: "part3",
      label: "Part III",
      title: "Derived Data",
      blurb:
        "Integrating multiple data systems — databases, caches, indexes, and processing frameworks — into coherent, reliable applications through batch and stream processing.",
      chapters: [
        {
          id: "ch10",
          number: 10,
          title: "Batch Processing",
          summary:
            "Unix tools, MapReduce, and distributed filesystems — processing large bounded datasets to produce derived outputs.",
          status: "coming",
          sections: [],
        },
        {
          id: "ch11",
          number: 11,
          title: "Stream Processing",
          summary:
            "Event streams, message brokers, change data capture, and processing unbounded data as it arrives.",
          status: "coming",
          sections: [],
        },
        {
          id: "ch12",
          number: 12,
          title: "The Future of Data Systems",
          summary:
            "Putting it all together — dataflow, derived state, correctness, and doing the right thing when building data systems.",
          status: "coming",
          sections: [],
        },
      ],
    },
  ],
};
