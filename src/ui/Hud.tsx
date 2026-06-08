import { STATIONS, STATION_ORDER } from '../lib/stations';
import { usePortfolio } from '../state/store';

/** Decorative instrument-panel readout in the corner — reinforces the map feel. */
export function Hud() {
  const activeStation = usePortfolio((s) => s.activeStation);
  const activeProject = usePortfolio((s) => s.activeProject);

  const index = STATION_ORDER.indexOf(activeStation) + 1;
  const coord = activeProject ? `EST. ${activeProject.year}` : '—';
  const label = activeProject ? activeProject.name : STATIONS[activeStation].label;

  return (
    <div className="hud" aria-hidden>
      <span className="hud__coord">{coord}</span>
      <span className="hud__sep">/</span>
      <span className="hud__label">{label}</span>
      <span className="hud__sep">/</span>
      <span className="hud__index">
        {String(index).padStart(2, '0')} — {String(STATION_ORDER.length).padStart(2, '0')}
      </span>
    </div>
  );
}
