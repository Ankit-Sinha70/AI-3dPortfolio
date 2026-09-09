import { projects } from './projects.js';

export const assistantKnowledge = {
  identity: {
    name: 'Ankit Sinha',
    title: 'Generative AI Engineer',
    positioning: 'I build production-minded AI systems and the product surfaces around them — not just isolated demos.',
  },
  stack: [
    'Python',
    'PyTorch',
    'TypeScript',
    'FastAPI',
    'LangChain',
    'Astro',
    'Three.js',
    'GLSL',
    'GSAP',
    'Docker',
    'PostgreSQL',
    'WebSockets',
  ],
  capabilities: [
    {
      id: 'agents',
      title: 'LLM & Agent Systems',
      summary: 'Designing retrieval, tool-use, orchestration, evaluation, and human-in-the-loop systems around language models.',
      stack: ['LLMs', 'RAG', 'Tool use', 'Evaluation', 'Agent orchestration'],
    },
    {
      id: 'vision',
      title: 'Applied Computer Vision',
      summary: 'Building practical image-generation and model-serving workflows, including fine-tuning and inference infrastructure.',
      stack: ['PyTorch', 'Diffusion', 'LoRA', 'Inference'],
    },
    {
      id: 'webgl',
      title: '3D / WebGL Engineering',
      summary: 'Turning technical ideas into interactive visual systems with Three.js, custom shaders, and scroll-driven motion.',
      stack: ['Three.js', 'GLSL', 'GSAP', 'Interaction'],
    },
  ],
  projects,
  experience: [
    {
      period: 'Current',
      title: 'Generative AI Engineering',
      summary: 'Building across GenAI, agents, model serving, backend systems, and interactive product experiences.',
      tags: ['GenAI', 'Agents', 'Backend', 'WebGL'],
    },
    {
      period: 'Selected work',
      title: 'Systems over demos',
      summary: 'Focused on the engineering around AI features: retrieval quality, inference latency, orchestration, evaluation, and usable interfaces.',
      tags: ['AI systems', 'Product', 'Engineering'],
    },
  ],
  faq: {
    contact: 'The portfolio has a dedicated Contact section for starting a conversation about work, collaboration, or opportunities.',
    approach: 'My approach is to connect model behavior with reliable infrastructure and a clear product surface. I care about failure modes, evaluation, latency, and how the system feels to use.',
    differentiator: 'The portfolio combines production-minded AI engineering with interactive 3D/WebGL storytelling, so the work is demonstrated as systems rather than a static list of technologies.',
  },
};
