import { skills } from '../data/content';

export function SkillsPanel({ active }: { active: boolean }) {
  return (
    <section
      className={`panel panel--left${active ? ' is-active' : ''}`}
      aria-hidden={!active}
      aria-label="Skills"
    >
      <p className="panel__eyebrow">02 — Skills</p>
      <h2 className="panel__title">Tools of the trade</h2>
      <div className="skills">
        {skills.map((group) => (
          <div className="skills__group" key={group.category}>
            <h3 className="skills__category">{group.category}</h3>
            <ul className="skills__list">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
