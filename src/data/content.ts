// ─────────────────────────────────────────────────────────────────────────
// Single source of truth for all portfolio content.
// Swap these for your real details — everything else reads here.
// ─────────────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  /** One-line hook shown on the marker label and modal header. */
  blurb: string;
  /** Longer paragraph for the modal body. */
  description: string;
  /** The need or challenge the project set out to solve. */
  problem: string;
  /** Concrete technologies and tools used to build it. */
  techStack: string[];
  /** Short, first-person note on what building it taught me. */
  reflection: string;
  year: string;
  tags: string[];
  /** Two hex colors used to render a generated cover gradient. */
  cover: [string, string];
  links: {
    live?: string;
    repo?: string;
  };
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface SocialLink {
  label: string;
  handle: string;
  href: string;
  /** Render as a file download (e.g. the resume PDF) rather than a navigation. */
  download?: boolean;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  /** Each entry is its own paragraph. */
  bio: string[];
  base: string;
  initials: string;
}

export const profile: Profile = {
  name: 'Emanuel Wertman',
  role: 'Developer · Student at MCST',
  tagline: 'I build web apps, data visualizations, and games — usually against a deadline.',
  base: 'Randolph, New Jersey',
  initials: 'EW',
  bio: [
    'I’m a student in the Computer Science Academy at the Morris County School of Technology (MCST), heading toward a career in software development. I’ve written code in a lot of languages, but I’m happiest working close to the metal in low-level languages and sinking my teeth into big, ambitious projects.',
    'I do a lot of my best work in competitions: the NASA App Development Challenge, the Neuromaker Challenge, hackathons, and CTFs. I enjoy the pressure of turning an idea into something that actually runs before the clock hits zero.',
    'In between, I’m usually deep in a side project — a reinforcement learning model that learns to balance a double pendulum, a Java banking app, and the procedurally generated planet you’re standing on right now.',
  ],
};

export const skills: SkillGroup[] = [
  {
    category: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'C'],
  },
  {
    category: 'Frontend',
    items: ['React', 'React Native', 'Three.js', 'p5.js', 'HTML & CSS'],
  },
  {
    category: 'Backend & Data',
    items: ['Flask', 'Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    category: 'Ways of Working',
    items: ['Hackathons', 'Game Jams', 'Team Projects', 'Jira', 'Git & GitHub'],
  },
];

export const socials: SocialLink[] = [
  { label: 'Email', handle: 'emanuel.wertman@gmail.com', href: 'mailto:emanuel.wertman@gmail.com' },
  { label: 'GitHub', handle: '@emanuelwertman', href: 'https://github.com/emanuelwertman' },
  { label: 'LinkedIn', handle: 'Emanuel Wertman', href: 'https://www.linkedin.com/in/emanuel-wertman-39533832b/' },
  { label: 'Resume', handle: 'Download PDF', href: '/Emanuel_Wertman_Resume_2026.pdf', download: true },
];

export const projects: Project[] = [
  {
    id: 'venatio',
    name: 'Venatio',
    blurb: 'Real-time Artemis II mission & antenna visualizer.',
    description:
      'Built for the NASA App Development Challenge with a team of six, Venatio visualizes the flight path of Artemis II and uses the link-budget formula with SCaN antenna data to show, in real time, which ground antennas have line-of-sight to communicate with the spacecraft. Rendered with p5.js inside a React / React Native app over a ten-week build.',
    problem:
      'Communication windows for a spacecraft depend on orbital geometry and antenna line-of-sight — relationships that are hard to grasp from raw telemetry. Venatio turns the link-budget math and SCaN ground-station data into a live picture of exactly when Artemis II can reach Earth.',
    techStack: ['TypeScript', 'React', 'React Native', 'p5.js', 'SCaN antenna dataset', 'Link-budget math'],
    reflection:
      'I learned how to translate a physics formula into something you can watch happen in real time, and how to keep a six-person team aligned across a ten-week build without the project drifting apart.',
    year: '2024',
    tags: ['p5.js', 'React', 'React Native', 'Data Viz'],
    cover: ['#0B1E3F', '#D8552F'],
    links: { repo: 'https://github.com/emanuelwertman/nasaADC2024' },
  },
  {
    id: 'eduflash',
    name: 'EduFlash',
    blurb: 'A community-powered, AI-assisted learning library.',
    description:
      'EduFlash is a free, open library of lesson plans and guides anyone can read, write, and improve — with AI-assisted authoring, multi-language support, and a trust/rating system to keep content reliable. Built at Empower Hacks 3.0 in vanilla JavaScript for accessibility, backed by a Flask + PostgreSQL API hosted on AWS.',
    problem:
      'Good learning material is often paywalled, scattered, or unavailable in a learner’s language. EduFlash makes it free and collaborative, while a trust and rating system guards against the unreliable content that open editing usually invites.',
    techStack: ['Vanilla JavaScript', 'Flask', 'PostgreSQL', 'AWS', 'AI authoring'],
    reflection:
      'Building accessibility-first in plain JavaScript taught me how much you can do without a framework. Designing the trust/rating system and standing up a Flask + Postgres backend on AWS under hackathon pressure showed me how to make scope decisions fast.',
    year: '2025',
    tags: ['Vanilla JS', 'Flask', 'PostgreSQL', 'AWS'],
    cover: ['#143A2B', '#E8C547'],
    links: { repo: 'https://github.com/emanuelwertman/EduFlash' },
  },
  {
    id: 'runbank',
    name: 'RunBank',
    blurb: 'An online banking app, built in Java.',
    description:
      'RunBank is an online banking application written in Java — accounts, transactions, and the everyday flows of a small bank — built to practice clean object-oriented design and real domain modelling.',
    problem:
      'Banking is a deceptively rich domain: accounts, balances, and transactions all have rules that have to stay consistent. RunBank models those flows from scratch as an exercise in getting the object design right before piling on features.',
    techStack: ['Java', 'Object-oriented design', 'Domain modelling'],
    reflection:
      'Modelling a real domain by hand taught me that clean class boundaries and separation of concerns aren’t academic — they’re what let me add features later without the whole thing tangling up.',
    year: '2026',
    tags: ['Java', 'OOP', 'Banking'],
    cover: ['#1B2A4A', '#6FB1C9'],
    links: { repo: 'https://github.com/emanuelwertman/RunBank' },
  },
  {
    id: 'teddybearclinic',
    name: 'Teddy Bear Clinic',
    blurb: 'A playful full-stack Flask web app.',
    description:
      'A web application with a Flask backend and a hand-built HTML/CSS/JavaScript frontend — a full-stack project covering routing, templates, static assets, and server-side logic end to end.',
    problem:
      'I wanted to build a complete web app end to end — no framework scaffolding hiding the moving parts — so I could see exactly how routing, templates, static assets, and server-side logic fit together.',
    techStack: ['Flask', 'Python', 'Jinja templates', 'HTML', 'CSS', 'JavaScript'],
    reflection:
      'Wiring the full request lifecycle by hand demystified the line between frontend and backend — I came away actually understanding what happens between a click and a rendered page.',
    year: '2026',
    tags: ['Flask', 'Python', 'HTML/CSS/JS'],
    cover: ['#4A1B2A', '#E8A0B0'],
    links: { repo: 'https://github.com/emanuelwertman/TeddyBearClinic' },
  },
  {
    id: 'beam',
    name: 'BEAM',
    blurb: 'Our entry for the Neuromaker challenge.',
    description:
      'BEAM is a TypeScript app built for the Neuromaker Challenge — a competition project pairing an interactive frontend with the challenge’s neuro/health-tech brief.',
    problem:
      'The Neuromaker Challenge sets a neuro/health-tech brief and judges you against it. BEAM had to take that prompt and turn it into an interactive app that was both technically sound and clear enough to demo under judging.',
    techStack: ['TypeScript', 'Interactive web frontend'],
    reflection:
      'Working inside a strict competition brief taught me to scope toward the judging criteria — building the right thing, not the most ambitious thing, in the time we had.',
    year: '2025',
    tags: ['TypeScript', 'Health Tech', 'Competition'],
    cover: ['#2A1B3D', '#6FB1C9'],
    links: { repo: 'https://github.com/emanuelwertman/BEAM-Neuromaker' },
  },
  {
    id: 'tethered',
    name: 'Tethered',
    blurb: 'A game-jam game about being tied together.',
    description:
      'Tethered is a JavaScript game made for the 2026 CIS Game Jam with Team 15, built around the jam’s “tethered” theme — designed, coded, and shipped within the jam’s tight window.',
    problem:
      'A game jam hands you a one-word theme — “tethered” — and a tight clock. The challenge was to turn that prompt into a mechanic that actually plays, then design, build, and ship a finished game before time ran out.',
    techStack: ['JavaScript', 'HTML5 Canvas', 'Game design'],
    reflection:
      'The jam taught me to scope ruthlessly: pick one idea that fits the theme, cut everything that won’t ship in the window, and get something playable in front of people on time.',
    year: '2026',
    tags: ['JavaScript', 'Game Jam', 'Game Dev'],
    cover: ['#0F2C3F', '#D8552F'],
    links: { repo: 'https://github.com/emanuelwertman/tethered-game-jam' },
  },
];
