import { socials } from '../data/content';

export function Socials() {
  return (
    <ul className="socials" aria-label="Social links">
      {socials.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            download={s.download || undefined}
            target={s.download ? undefined : '_blank'}
            rel="noreferrer noopener"
          >
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
