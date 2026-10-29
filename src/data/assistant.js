import { projects } from './projects.js';

// Extra phrases visitors might use to refer to each project (matched against the question).
const projectAliases = {
  qisquare: ['qi square', 'equity research', 'financial analytics'],
  'iatf-toolbox': ['iatf', 'toolbox', 'compliance'],
  'solution-to-share': ['solution to share', 'calendar plus', 'file manager'],
  'crown-restaurant': ['crown', 'restaurant'],
  'ai-interview-simulator': ['interview'],
  'portfolio-3d': ['3d portfolio', 'portfolio website'],
  'ai-resume-analyzer': ['resume analyzer', 'resume'],
};

export const assistantKnowledge = {
  identity: {
    name: 'Ankit Kumar Sinha',
    title: 'Full-Stack Engineer',
    positioning:
      'Full-stack engineer with 3+ years of experience building responsive, high-performance web applications across financial analytics, automotive SaaS, enterprise productivity, and restaurant management.',
  },
  stack: [
    'React.js',
    'Next.js',
    'Angular',
    'TypeScript',
    'Node.js',
    'Express.js',
    'MongoDB',
    'Tailwind CSS',
    'Redux',
    'Zustand',
    'Stripe',
    'Three.js',
  ],
  capabilities: [
    {
      id: 'fullstack',
      title: 'Full-Stack Web Applications',
      summary:
        'Responsive front ends in React.js, Next.js and Angular with Node.js, Express and MongoDB behind them, including REST API design, JWT and OAuth 2.0 authentication, and role-based access control. Optimizing API integrations cut average response time by 30% on a client engagement.',
      stack: ['React.js', 'Next.js', 'Angular', 'Node.js', 'Express.js', 'MongoDB'],
    },
    {
      id: 'ui',
      title: 'UI Systems & Data Visualization',
      summary:
        'Built 15+ reusable, accessible UI components with Tailwind CSS and ShadCN, and interactive analytics with Recharts, Plotly and Kendo Charts, including peer comparison, trend analysis and valuation reports with PDF and Excel export.',
      stack: ['Tailwind CSS', 'ShadCN UI', 'Kendo UI', 'Angular Material', 'Recharts'],
    },
    {
      id: 'ai',
      title: 'AI & LLM Integration',
      summary:
        'Integrates Anthropic Claude, OpenAI, Gemini and Groq behind provider-agnostic layers: audit-ready compliance documents in the IATF Solutions Toolbox, an AI mock-interview platform with adaptive scoring, and a resume analyzer.',
      stack: ['Anthropic Claude', 'OpenAI', 'Gemini', 'Groq', 'Zod'],
    },
    {
      id: 'performance',
      title: 'Performance & 3D',
      summary:
        'Lighthouse auditing, lazy loading and asset optimization, plus Three.js scenes with custom lighting, camera controls and transitions. A 3D portfolio built with React, Vite and Three.js scored 90+ on Lighthouse performance.',
      stack: ['Lighthouse', 'Three.js', 'Vite', 'Lazy loading'],
    },
  ],
  projects: projects.map((project) => ({ ...project, aliases: projectAliases[project.slug] ?? [] })),
  experience: [
    {
      period: 'Feb 2023 – Present',
      title: 'Full-Stack Engineer, Brainerhub Solutions (Ahmedabad)',
      summary:
        'Delivered production applications for 5+ clients across restaurant, SaaS, financial analytics and enterprise domains; cut average API response time by 30%; built 15+ reusable accessible UI components; shortened release cycles by 15% working with a team of 8; and owned delivery timelines for 5+ concurrent client engagements.',
      tags: ['React.js', 'Next.js', 'Angular', 'Node.js', 'TypeScript'],
    },
    {
      period: '2015 – 2018',
      title: 'BA English Honours, Giridih College (Vinoba Bhave University)',
      summary:
        'Self-taught engineer: completed structured React.js, Next.js, Angular, TypeScript and Node.js coursework via Udemy and freeCodeCamp, applied across 5+ production-grade client and personal projects.',
      tags: ['Self-taught', 'Udemy', 'freeCodeCamp'],
    },
  ],
  faq: {
    contact:
      'The Contact section has an email link and a downloadable resume for starting a conversation about work, collaboration, or opportunities.',
    approach:
      'Reusable, accessible components, optimized REST API integrations, role-based access control, and on-time delivery across concurrent client engagements.',
    differentiator:
      'Breadth across the stack, with Angular and React front ends, Node.js back ends, Stripe billing and LLM integrations, plus a record of on-time delivery across 5+ concurrent client engagements.',
  },
};
