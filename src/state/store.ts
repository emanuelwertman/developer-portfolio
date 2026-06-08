import { create } from 'zustand';
import type { Project } from '../data/content';
import type { StationId } from '../lib/stations';

interface PortfolioState {
  /** Which camera station is currently active. */
  activeStation: StationId;
  /** The project whose detail modal is open, or null. */
  activeProject: Project | null;
  /** World-space point the camera should fly to when a project is focused. */
  focusTarget: [number, number, number] | null;
  /** Flips true once the scene has rendered its first frame. */
  ready: boolean;

  goToStation: (station: StationId) => void;
  openProject: (project: Project, focusTarget: [number, number, number]) => void;
  closeProject: () => void;
  setReady: () => void;
}

export const usePortfolio = create<PortfolioState>((set) => ({
  activeStation: 'home',
  activeProject: null,
  focusTarget: null,
  ready: false,

  goToStation: (station) => set({ activeStation: station, activeProject: null, focusTarget: null }),
  openProject: (project, focusTarget) => set({ activeProject: project, focusTarget }),
  closeProject: () => set({ activeProject: null, focusTarget: null }),
  setReady: () => set({ ready: true }),
}));
