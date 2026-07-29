// Shared post data source for the Blog index (src/pages/blog/index.astro)
// and individual post pages (src/pages/blog/[slug].astro).
// Add a post here once; both surfaces stay in sync.

export const posts = [
  {
    slug: 'grounding-rag-in-citations',
    title: 'Grounding a RAG assistant in citations, not vibes',
    date: '2026-06-18',
    excerpt:
      'Hybrid retrieval closed the recall gap. Forcing every answer to cite a passage is what actually killed the hallucinations.',
    tags: ['RAG', 'LLMs', 'Retrieval'],
    body: [
      "Most write-ups about retrieval-augmented generation focus on the retrieval half: chunking strategy, embedding model, reranking. Those matter, but they weren't the thing that made Ledger (a RAG assistant I built over internal docs) trustworthy enough to actually use. The thing that mattered was refusing to let the model answer from anything except what it just retrieved.",
      "Early on, Ledger behaved like most RAG demos: retrieve some passages, stuff them in the prompt, let the model do what it wants. It usually used the context. Sometimes it didn't, and you couldn't tell which case you were in just by reading the answer. An answer that blends one real fact with one remembered-from-training fact is worse than an answer that's entirely wrong, because it looks equally confident either way.",
      "The fix wasn't a bigger model or a cleverer prompt. It was structural: every claim in the output has to trace back to a specific retrieved passage, and the UI shows that link. If the retrieved passages don't support an answer, the assistant says so instead of filling the gap from memory. That constraint is annoying to build against — it means some questions get a worse answer than an ungrounded model would confidently give — but it means every answer you do get can be checked in seconds instead of trusted on faith.",
      "The other half was hybrid search. Pure vector search is great at 'find me something semantically similar' and bad at 'find me the passage that contains this exact product ID.' Keyword search is the reverse. Running both and merging the results closed a class of failures that no amount of embedding-model upgrades fixed on their own.",
      "None of this is novel — grounding and hybrid retrieval are both well-documented patterns at this point. The lesson was more about sequencing: it's tempting to spend the first few weeks tuning retrieval quality, when the highest-leverage change is often the one that constrains what the model's allowed to say with whatever it retrieves.",
    ],
  },
];
