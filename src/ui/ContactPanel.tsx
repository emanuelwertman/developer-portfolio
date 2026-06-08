import { profile, socials } from '../data/content';

export function ContactPanel({ active }: { active: boolean }) {
  return (
    <section
      className={`panel panel--bottom${active ? ' is-active' : ''}`}
      aria-hidden={!active}
      aria-label="Contact"
    >
      <p className="panel__eyebrow">03 — Contact</p>
      <h2 className="panel__title">Let’s build something.</h2>
      <p className="panel__subtitle">Open to interesting work and collaborations.</p>
      <ul className="contact-links">
        {socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} target={s.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer noopener">
              <span className="contact-links__label">{s.label}</span>
              <span className="contact-links__handle">{s.handle}</span>
              <span className="contact-links__arrow" aria-hidden>
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="panel__signoff">{profile.name} · {new Date().getFullYear()}</p>
    </section>
  );
}
