import { profile } from '../data/content';
import { usePortfolio } from '../state/store';

export function Brand() {
  const goToStation = usePortfolio((s) => s.goToStation);
  return (
    <button className="brand" onClick={() => goToStation('home')} aria-label="Go to home view">
      <span className="brand__name">{profile.name}</span>
      <span className="brand__role">{profile.role}</span>
    </button>
  );
}
