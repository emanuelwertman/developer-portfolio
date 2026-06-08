import { profile, projects, skills, socials } from '../data/content';

/** Static, fully-accessible portfolio shown when WebGL is unavailable. */
export function Fallback() {
  return (
    <main className="fallback">
      <header className="fallback__header">
        <p className="fallback__role">{profile.role}</p>
        <h1 className="fallback__name">{profile.name}</h1>
        <p className="fallback__tagline">{profile.tagline}</p>
      </header>

      <section className="fallback__section" aria-label="About">
        <h2>About</h2>
        {profile.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className="fallback__section" aria-label="Projects">
        <h2>Projects</h2>
        <ul className="fallback__projects">
          {projects.map((p) => (
            <li key={p.id}>
              <h3>{p.name}</h3>
              <p className="fallback__place">{p.year}</p>
              <p>{p.description}</p>
              <p className="fallback__links">
                {p.links.live && (
                  <a href={p.links.live} target="_blank" rel="noreferrer noopener">
                    Live ↗
                  </a>
                )}
                {p.links.repo && (
                  <a href={p.links.repo} target="_blank" rel="noreferrer noopener">
                    Source ↗
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="fallback__section" aria-label="Skills">
        <h2>Skills</h2>
        {skills.map((g) => (
          <p key={g.category}>
            <strong>{g.category}:</strong> {g.items.join(', ')}
          </p>
        ))}
      </section>

      <section className="fallback__section" aria-label="Contact">
        <h2>Contact</h2>
        <ul>
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer noopener">
                {s.label} — {s.handle}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
