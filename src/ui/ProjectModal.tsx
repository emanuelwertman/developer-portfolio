import { useEffect, useRef } from 'react';
import { usePortfolio } from '../state/store';

export function ProjectModal() {
  const activeProject = usePortfolio((s) => s.activeProject);
  const closeProject = usePortfolio((s) => s.closeProject);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activeProject) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProject();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeProject, closeProject]);

  if (!activeProject) return null;
  const p = activeProject;

  return (
    <div className="modal-layer" role="presentation" onClick={closeProject}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal__cover"
          style={{ background: `linear-gradient(135deg, ${p.cover[0]}, ${p.cover[1]})` }}
          aria-hidden
        >
          <span className="modal__cover-year">{p.year}</span>
          <span className="modal__cover-mark">{p.name.charAt(0)}</span>
        </div>

        <div className="modal__content">
          <h2 className="modal__title" id="modal-title">
            {p.name}
          </h2>
          <p className="modal__blurb">{p.blurb}</p>
          <p className="modal__desc">{p.description}</p>

          <section className="modal__section">
            <h3 className="modal__label">The Problem</h3>
            <p className="modal__section-body">{p.problem}</p>
          </section>

          <section className="modal__section">
            <h3 className="modal__label">Tech Stack</h3>
            <ul className="modal__stack">
              {p.techStack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <section className="modal__section">
            <h3 className="modal__label">What I Learned</h3>
            <p className="modal__section-body">{p.reflection}</p>
          </section>

          <ul className="modal__tags">
            {p.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="modal__actions">
            {p.links.live && (
              <a className="btn btn--solid" href={p.links.live} target="_blank" rel="noreferrer noopener">
                Visit live ↗
              </a>
            )}
            {p.links.repo && (
              <a className="btn btn--ghost" href={p.links.repo} target="_blank" rel="noreferrer noopener">
                Source ↗
              </a>
            )}
          </div>
        </div>

        <button ref={closeRef} className="modal__close" onClick={closeProject} aria-label="Close project">
          ✕
        </button>
      </div>
    </div>
  );
}
