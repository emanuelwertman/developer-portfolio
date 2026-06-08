import { STATIONS, STATION_ORDER } from '../lib/stations';
import { usePortfolio } from '../state/store';

export function Nav() {
  const activeStation = usePortfolio((s) => s.activeStation);
  const activeProject = usePortfolio((s) => s.activeProject);
  const goToStation = usePortfolio((s) => s.goToStation);

  return (
    <nav className="nav" aria-label="Primary">
      <ol>
        {STATION_ORDER.map((id, i) => {
          const current = activeStation === id && !activeProject;
          return (
            <li key={id}>
              <button
                className={`nav__link${current ? ' is-current' : ''}`}
                aria-current={current ? 'true' : undefined}
                onClick={() => goToStation(id)}
              >
                <span className="nav__index">{String(i + 1).padStart(2, '0')}</span>
                <span className="nav__label">{STATIONS[id].label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
