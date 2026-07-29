// Shared project data source for the Work grid (src/components/Work.astro)
// and the individual case-study pages (src/pages/work/[slug].astro).
// Add a project here once; both surfaces stay in sync.

export const projects = [
  {
    slug: 'aurora',
    title: 'Aurora — Text-to-Image Pipeline',
    description:
      'End-to-end diffusion pipeline with custom LoRA fine-tuning, queued inference, and a review UI for output curation.',
    tags: ['Diffusion', 'LoRA', 'FastAPI'],
    role: 'Solo engineer — model, backend, and review tooling.',
    summary:
      'Aurora turns a small set of reference images into a fine-tuned diffusion checkpoint, then serves it behind a queued inference API so generation requests never block on GPU availability.',
    problem:
      "Ad-hoc fine-tuning scripts and manual prompt testing didn't scale past a handful of styles. There was no way to review, compare, or roll back checkpoints without digging through raw output folders.",
    approach: [
      'Built a LoRA fine-tuning harness on top of a base diffusion model, with checkpoint versioning so every training run is reproducible.',
      'Queued inference through a FastAPI service backed by a job queue, so bursts of requests degrade gracefully instead of timing out.',
      'Shipped a lightweight review UI for side-by-side output comparison across checkpoints, used to decide which fine-tune ships.',
    ],
    outcome:
      'Cut the time from "new reference set" to "usable checkpoint" from a manual afternoon to a queued job measured in minutes, with a paper trail for every version shipped.',
  },
  {
    slug: 'echo',
    title: 'Echo — Voice Cloning Service',
    description:
      'Low-latency voice synthesis service with speaker embedding cache and streaming playback.',
    tags: ['TTS', 'PyTorch', 'WebSockets'],
    role: 'Solo engineer — model serving, caching layer, streaming API.',
    summary:
      'Echo clones a speaker from a short reference clip and streams synthesized speech back over a WebSocket, targeting conversational latency rather than batch rendering.',
    problem:
      'Naive per-request inference re-computed the speaker embedding every call, and clients had to wait for a full audio file before playback could start.',
    approach: [
      'Cached speaker embeddings keyed by voice profile, so repeat requests for the same voice skip the expensive encoding step.',
      'Switched delivery to a WebSocket stream, sending audio chunks as they render instead of waiting on the full clip.',
      'Tuned the PyTorch inference path (batching, precision) to keep first-chunk latency low enough for near-real-time playback.',
    ],
    outcome:
      'Brought time-to-first-audio down from full-clip wait to a streaming start, making the service usable for live, conversational use cases instead of just offline rendering.',
  },
  {
    slug: 'ledger',
    title: 'Ledger — RAG Knowledge Assistant',
    description:
      'Retrieval-augmented assistant over internal docs with hybrid search and citation-grounded answers.',
    tags: ['RAG', 'Vector DB', 'LangChain'],
    role: 'Solo engineer — retrieval pipeline, grounding, and evaluation.',
    summary:
      'Ledger answers questions over a private document set and grounds every answer in the source passages it retrieved, instead of letting the model answer from memory.',
    problem:
      'Pure vector search missed exact-match queries (IDs, terse keywords), and early answers had no way to verify which document they came from.',
    approach: [
      'Combined dense vector retrieval with keyword search in a hybrid ranker, so exact terms and semantic queries both surface the right passages.',
      'Forced citation-grounded generation: the assistant can only answer using retrieved passages, and every claim links back to its source.',
      'Built a small evaluation set of real questions to catch retrieval regressions before they reached users.',
    ],
    outcome:
      'Reduced unsupported or hallucinated answers by grounding every response in a traceable source passage, and hybrid search closed the gap on queries pure vector search missed.',
  },
  {
    slug: 'drift',
    title: 'Drift — Agentic Workflow Runner',
    description:
      'Multi-step agent orchestration with tool calling, retries, and human-in-the-loop checkpoints.',
    tags: ['Agents', 'Orchestration', 'TypeScript'],
    role: 'Solo engineer — orchestration engine and tool interface.',
    summary:
      "Drift runs multi-step agent workflows that call tools, retry on failure, and pause for human approval at checkpoints the workflow author defines.",
    problem:
      'Long agent chains would silently fail mid-way or take an unsafe action with no way for a human to intervene before it committed.',
    approach: [
      'Modeled workflows as a typed step graph in TypeScript, so each step declares its inputs, tools, and retry policy up front.',
      'Added automatic retries with backoff for transient tool failures, separate from a distinct "needs human approval" pause state.',
      'Built human-in-the-loop checkpoints that halt the run and surface full context before any irreversible action executes.',
    ],
    outcome:
      'Turned brittle, all-or-nothing agent chains into resumable workflows where failures are retried automatically and risky steps wait for a human sign-off.',
  },
  {
    slug: 'halo',
    title: 'Halo — Generative Video Prototyping',
    description:
      'Frame-consistent short-form video generation pipeline with prompt-driven storyboard control.',
    tags: ['Video Gen', 'Python', 'FFmpeg'],
    role: 'Solo engineer — generation pipeline and storyboard tooling.',
    summary:
      'Halo generates short-form video from a prompt-driven storyboard, keeping subjects and style consistent frame-to-frame instead of generating each frame independently.',
    problem:
      'Frame-independent generation produced flicker and identity drift — the same "character" would subtly change across a clip, which reads as broken to a viewer.',
    approach: [
      'Introduced a storyboard layer where a prompt sequence defines shots, letting the pipeline condition each frame on its neighbors rather than generating in isolation.',
      'Carried forward reference frames and style embeddings across the sequence to hold subject and palette consistent.',
      'Used FFmpeg for the assembly stage — frame interpolation, timing, and encoding — decoupled from the generation step so either can be iterated on independently.',
    ],
    outcome:
      'Reduced visible flicker and identity drift enough that short clips read as one continuous shot rather than a slideshow of related images.',
  },
];
