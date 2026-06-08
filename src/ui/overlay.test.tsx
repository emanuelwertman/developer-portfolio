import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Nav } from './Nav';
import { AboutPanel } from './AboutPanel';
import { Fallback } from './Fallback';
import { ProjectModal } from './ProjectModal';
import { usePortfolio } from '../state/store';
import { profile, projects } from '../data/content';

beforeEach(() => {
  usePortfolio.setState({ activeStation: 'home', activeProject: null, focusTarget: null });
});

describe('Nav', () => {
  it('renders every station and drives the store on click', () => {
    render(<Nav />);
    fireEvent.click(screen.getByText('Skills'));
    expect(usePortfolio.getState().activeStation).toBe('skills');
  });

  it('marks the active station with aria-current', () => {
    usePortfolio.setState({ activeStation: 'about' });
    render(<Nav />);
    const about = screen.getByText('About').closest('button');
    expect(about).toHaveAttribute('aria-current', 'true');
  });
});

describe('AboutPanel', () => {
  it('renders profile content from config', () => {
    render(<AboutPanel active />);
    expect(screen.getByText(profile.name)).toBeInTheDocument();
    expect(screen.getByText(profile.bio[0])).toBeInTheDocument();
  });

  it('is hidden from assistive tech when inactive', () => {
    const { container } = render(<AboutPanel active={false} />);
    expect(container.querySelector('section')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Fallback', () => {
  it('lists all projects for the no-WebGL experience', () => {
    render(<Fallback />);
    for (const p of projects) {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    }
  });
});

describe('ProjectModal', () => {
  it('renders nothing when no project is active', () => {
    const { container } = render(<ProjectModal />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the active project and closes on the close button', () => {
    usePortfolio.setState({ activeProject: projects[0], focusTarget: [1, 0, 0] });
    render(<ProjectModal />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(projects[0].description)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close project'));
    expect(usePortfolio.getState().activeProject).toBeNull();
  });

  it('closes on Escape', () => {
    usePortfolio.setState({ activeProject: projects[2], focusTarget: [0, 1, 0] });
    render(<ProjectModal />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(usePortfolio.getState().activeProject).toBeNull();
  });
});
