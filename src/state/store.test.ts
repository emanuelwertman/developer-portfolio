import { beforeEach, describe, expect, it } from 'vitest';
import { usePortfolio } from './store';
import { projects } from '../data/content';

const reset = () =>
  usePortfolio.setState({
    activeStation: 'home',
    activeProject: null,
    focusTarget: null,
    ready: false,
  });

describe('portfolio store', () => {
  beforeEach(reset);

  it('navigates between stations', () => {
    usePortfolio.getState().goToStation('skills');
    expect(usePortfolio.getState().activeStation).toBe('skills');
  });

  it('opens a project with a focus target', () => {
    usePortfolio.getState().openProject(projects[0], [1, 0, 0]);
    const s = usePortfolio.getState();
    expect(s.activeProject?.id).toBe(projects[0].id);
    expect(s.focusTarget).toEqual([1, 0, 0]);
  });

  it('closing a project clears it but keeps the station', () => {
    usePortfolio.getState().goToStation('about');
    usePortfolio.getState().openProject(projects[1], [0, 1, 0]);
    usePortfolio.getState().closeProject();
    const s = usePortfolio.getState();
    expect(s.activeProject).toBeNull();
    expect(s.focusTarget).toBeNull();
    expect(s.activeStation).toBe('about');
  });

  it('navigating to a station dismisses any open project', () => {
    usePortfolio.getState().openProject(projects[0], [1, 0, 0]);
    usePortfolio.getState().goToStation('contact');
    expect(usePortfolio.getState().activeProject).toBeNull();
  });

  it('marks the scene ready', () => {
    usePortfolio.getState().setReady();
    expect(usePortfolio.getState().ready).toBe(true);
  });
});
