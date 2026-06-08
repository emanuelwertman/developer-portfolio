import { profile, projects } from '../data/content';

export function HomeIntro({ active }: { active: boolean }) {
  return (
    <section className={`home-intro${active ? ' is-active' : ''}`} aria-hidden={!active}>
      <p className="home-intro__eyebrow">Interactive Portfolio · {projects.length} Projects</p>
      <h1 className="home-intro__title">{profile.tagline}</h1>
      <p className="home-intro__hint">
        <span className="dot" /> Drag to spin the globe · select a marker to open a project
      </p>
    </section>
  );
}
