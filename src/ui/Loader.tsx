import { useEffect, useState } from 'react';
import { usePortfolio } from '../state/store';

/** Brief intro veil; fades out once the scene reports its first frame. */
export function Loader() {
  const ready = usePortfolio((s) => s.ready);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGone(true), 650);
    return () => clearTimeout(t);
  }, [ready]);

  if (gone) return null;

  return (
    <div className={`loader${ready ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      <div className="loader__mark">
        <span className="loader__ring" />
      </div>
      <p className="loader__text">Plotting coordinates…</p>
    </div>
  );
}
