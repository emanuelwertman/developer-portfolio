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
    'I’m a developer studying at the Morris County School of Technology (MCST). I like working across the stack — interactive web apps, data visualizations, and the occasional game.',
    'A lot of my favorite work comes out of teams under time pressure: the NASA App Development Challenge, hackathons like Empower Hacks, and school game jams. I enjoy turning an ambitious idea into something that actually runs before the clock hits zero.',
    'Between competitions I’m usually deep in a side project — lately a procedurally generated planet (the one you’re standing on), and before that everything from a Java banking app to C++ coursework.',
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
];

export const projects: Project[] = [
  {
    id: 'venatio',
    name: 'Venatio',
    blurb: 'Real-time Artemis II mission & antenna visualizer.',
    description:
      'Built for the NASA App Development Challenge with a team of six, Venatio visualizes the flight path of Artemis II and uses the link-budget formula with SCaN antenna data to show, in real time, which ground antennas have line-of-sight to communicate with the spacecraft. Rendered with p5.js inside a React / React Native app over a ten-week build.',
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
    year: '2026',
    tags: ['JavaScript', 'Game Jam', 'Game Dev'],
    cover: ['#0F2C3F', '#D8552F'],
    links: { repo: 'https://github.com/emanuelwertman/tethered-game-jam' },
  },
];
