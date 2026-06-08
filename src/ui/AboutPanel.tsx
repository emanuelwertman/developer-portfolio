import { profile } from '../data/content';

export function AboutPanel({ active }: { active: boolean }) {
  return (
    <section
      className={`panel panel--right${active ? ' is-active' : ''}`}
      aria-hidden={!active}
      aria-label="About"
    >
      <p className="panel__eyebrow">01 — About</p>
      <div className="panel__avatar" aria-hidden>
        {profile.initials}
      </div>
      <h2 className="panel__title">{profile.name}</h2>
      <p className="panel__subtitle">
        {profile.role} · {profile.base}
      </p>
      <div className="panel__body">
        {profile.bio.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </section>
  );
}
