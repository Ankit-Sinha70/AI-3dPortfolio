// Shared project data source for the Work grid (src/components/Work.astro)
// and the individual case-study pages (src/pages/work/[slug].astro).
// Add a project here once; both surfaces stay in sync.
//
// Content comes from the resume. `approach` holds what was built/worked on,
// `stack` is the full technology list for the case-study page, `tags` is the
// short list shown on the card, and `links` are optional external links.

export const projects = [
  {
    slug: 'qisquare',
    title: 'QISquare — Equity Research & Financial Analytics SaaS',
    description:
      'Institutional equity-research platform for financial analysts, with advanced data visualization and automated reporting.',
    tags: ['Angular 10', 'TypeScript', 'Auth0', 'Kendo UI'],
    stack: ['Angular 10', 'TypeScript', 'Auth0', 'Kendo UI', 'Angular Material'],
    role: 'Full-Stack Engineer at Brainerhub Solutions',
    period: 'Jun 2026 – Present',
    summary:
      'QISquare is an institutional equity-research SaaS platform serving financial analysts with advanced data visualization and automated reporting.',
    approach: [
      'Upgrading the platform off a deprecated Angular version, modernizing legacy modules and dependencies while preserving existing production functionality.',
      'Diagnosed and corrected data flows in the market-pricing and SEC EDGAR filing ingestion pipelines, restoring accuracy of the financial data surfaced across the platform.',
      'Maintained and extended reference-data and financial-statement modules, including Index Tags, Value Chain, and cascading country, currency, and exchange filters built with Angular Material and Kendo UI data grids.',
      'Extended role and permission-based access control to additional routes and modules within an established Auth0 JWT setup, working across Angular route guards and HTTP interceptors for secure multi-tenant access.',
      'Contributed to interactive analytical reports covering peer comparison, trend analysis, CAGR, manipulation detection, and Beta/CAPM valuation models, with interactive charts and PDF and Excel export.',
    ],
    links: [],
  },
  {
    slug: 'iatf-toolbox',
    title: 'IATF Solutions Toolbox — Automotive Quality Compliance Suite',
    description:
      'Turborepo monorepo of four AI-powered quality-engineering tools plus a Strapi CMS-driven marketing site.',
    tags: ['Next.js 16', 'Turborepo', 'Stripe', 'LLM APIs'],
    stack: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Turborepo',
      'Stripe',
      'Upstash Redis',
      'Anthropic',
      'OpenAI',
      'Gemini',
      'Strapi',
      'Zod',
    ],
    role: 'Full-Stack Engineer at Brainerhub Solutions',
    period: 'Jan 2026 – May 2026',
    summary:
      'The IATF Solutions Toolbox is an automotive quality-compliance SaaS suite: four AI-powered quality-engineering tools and a Strapi CMS-driven marketing site, built on shared UI, config, and API-client packages.',
    approach: [
      'Architected a Turborepo monorepo shipping 4 AI-powered quality-engineering tools plus a Strapi CMS-driven marketing site, backed by shared UI, config, and API-client packages.',
      'Engineered a provider-agnostic AI abstraction across Anthropic, OpenAI, and Gemini that generates audit-ready compliance artifacts, including root-cause analyses, compliance matrices, and management-review narratives, from structured input.',
      'Implemented end-to-end Stripe billing with checkout, webhooks, and credit-based usage metering, backed by Upstash Redis for session storage and API rate limiting.',
      'Automated multi-format document export pipelines producing .xlsx, .pdf, and .docx outputs from Zod-validated schemas, removing manual report preparation for end users.',
    ],
    links: [],
  },
  {
    slug: 'solution-to-share',
    title: 'Solution to Share GmbH — Calendar Plus & File Manager',
    description:
      'Enterprise productivity SaaS combining collaborative scheduling with secure document management for multi-user teams.',
    tags: ['React.js', 'TypeScript'],
    stack: ['React.js', 'TypeScript'],
    role: 'Full-Stack Engineer at Brainerhub Solutions',
    period: 'Jun 2025 – May 2026',
    summary:
      'An enterprise productivity SaaS that combines collaborative scheduling with secure document management for multi-user teams.',
    approach: [
      'Extended Calendar Plus with daily, weekly, and monthly recurring event scheduling, multi-user calendar sharing, automated conflict detection, color-coded tagging, and in-app notifications and reminders.',
      'Enhanced File Manager with in-browser PDF and image preview, advanced search and filtering, and role-based access control across user tiers, building on an existing folder hierarchy and upload/download layer.',
    ],
    links: [],
  },
  {
    slug: 'crown-restaurant',
    title: 'Crown Restaurant — Multi-location Management System',
    description:
      'Restaurant management across branches: a central admin panel for menu, orders, and reservations, plus a customer ordering interface.',
    tags: ['React.js', 'TypeScript'],
    stack: ['React.js', 'TypeScript'],
    role: 'Full-Stack Engineer at Brainerhub Solutions',
    period: 'Jan 2024 – Aug 2024',
    summary:
      'A multi-location restaurant management system with a centralized admin panel for branches and a responsive customer-facing interface.',
    approach: [
      'Built the platform end to end, delivering a centralized admin panel for menu, order, and reservation management across branches plus a responsive customer interface for browsing restaurants and placing orders.',
    ],
    links: [],
  },
  {
    slug: 'ai-interview-simulator',
    title: 'AI Interview Simulator',
    description:
      'Full-stack AI mock-interview platform with adaptive difficulty, webcam proctoring, and recruiter-grade reports.',
    tags: ['Next.js 16', 'MediaPipe', 'LLM providers', 'MongoDB'],
    stack: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Tailwind v4',
      'Radix UI',
      'MediaPipe FaceMesh',
      'Recharts',
      'Node.js',
      'Express',
      'MongoDB',
    ],
    role: 'Personal project — design and full-stack build',
    period: '',
    summary:
      'A full-stack AI mock-interview platform with adaptive difficulty, webcam and voice analysis, and recruiter-grade reports, live on Vercel.',
    approach: [
      'Built a full-stack AI mock-interview platform on a layered architecture (routes, controllers, services, AI engines) running adaptive interviews with real-time difficulty scaling, 5-dimension scoring, AI-generated follow-ups, and recruiter-grade reports.',
      'Engineered webcam-based proctoring in the browser with MediaPipe FaceMesh for real-time gaze and attention tracking, plus a voice mode scoring words per minute, filler words, and delivery confidence.',
      'Designed analytics dashboards with Recharts featuring skill radar and readiness scoring, and integrated JWT and Google OAuth authentication with Stripe subscriptions, webhooks, and refunds.',
      'Developed a Resume, GitHub, and Job-Description matching interface combining PDF parsing, repository analysis, ATS-style match scoring, and skill-gap detection.',
      'Designed a provider-agnostic AI engine using the factory pattern, enabling hot-swappable Gemini, Groq, and OpenAI backends without code changes.',
    ],
    links: [{ label: 'Live site', href: 'https://interview-simulator-psi.vercel.app' }],
  },
  {
    slug: 'portfolio-3d',
    title: '3D Portfolio Website',
    description:
      'Interactive Three.js portfolio with custom lighting, smooth camera controls, and scene transitions, scoring 90+ on Lighthouse performance.',
    tags: ['React.js', 'Vite', 'Three.js', 'Tailwind CSS'],
    stack: ['React.js', 'Vite', 'Three.js', 'Tailwind CSS'],
    role: 'Personal project — design and development',
    period: '',
    summary:
      'An interactive 3D portfolio built with React, Vite, and Three.js, with custom lighting, geometry, smooth camera controls, and scene transitions.',
    approach: [
      'Designed and deployed an interactive 3D portfolio with custom lighting, geometry, smooth camera controls, and scene transitions.',
      'Achieved a 90+ Lighthouse performance score through lazy loading, asset optimization, and responsive rendering across devices.',
    ],
    links: [{ label: 'Live site', href: 'https://ankit-sinha70.github.io' }],
  },
  {
    slug: 'ai-resume-analyzer',
    title: 'AI Resume Analyzer',
    description:
      'Full-stack TypeScript app that extracts skills from PDF resumes with LLMs and scores them against job descriptions.',
    tags: ['Next.js 14', 'Node.js', 'LLM providers', 'Zod'],
    stack: ['Next.js 14', 'TypeScript', 'Node.js', 'Express', 'OpenAI', 'Gemini', 'Groq', 'Zod', 'Winston'],
    role: 'Personal project — design and full-stack build',
    period: '',
    summary:
      'A full-stack TypeScript app that reads PDF resumes with LLMs, scores them against job descriptions, and suggests improvements.',
    approach: [
      'Built a full-stack TypeScript app extracting skills from PDF resumes via LLMs, scoring them against job descriptions, and generating actionable improvement suggestions behind a provider-agnostic AI layer with runtime provider switching and a mock mode for cost-free testing.',
      'Built a Next.js interface featuring drag-and-drop upload, dark mode, PDF export, and a normalized skill-matching engine that resolves synonyms such as k8s and Kubernetes to compute accurate match percentages.',
      'Structured the backend using Clean Architecture across domain, application, infrastructure, and interface layers in an npm-workspaces monorepo with shared types, Helmet, CORS, Zod validation, and Winston logging.',
    ],
    links: [{ label: 'GitHub profile', href: 'https://github.com/Ankit-Sinha70' }],
  },
];
