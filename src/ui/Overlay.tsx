import { usePortfolio } from '../state/store';
import { Brand } from './Brand';
import { Nav } from './Nav';
import { Socials } from './Socials';
import { Hud } from './Hud';
import { HomeIntro } from './HomeIntro';
import { AboutPanel } from './AboutPanel';
import { SkillsPanel } from './SkillsPanel';
import { ContactPanel } from './ContactPanel';
import { ProjectModal } from './ProjectModal';

/** The DOM layer sitting above the canvas. */
export function Overlay() {
  const activeStation = usePortfolio((s) => s.activeStation);
  const activeProject = usePortfolio((s) => s.activeProject);
  const at = (id: typeof activeStation) => activeStation === id && !activeProject;

  return (
    <div className="overlay">
      <Brand />
      <Nav />
      <Socials />
      <Hud />

      <HomeIntro active={at('home')} />
      <AboutPanel active={at('about')} />
      <SkillsPanel active={at('skills')} />
      <ContactPanel active={at('contact')} />

      <ProjectModal />
    </div>
  );
}
