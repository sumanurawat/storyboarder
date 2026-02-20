import ChatPanel from '../chat/ChatPanel.jsx';
import EntityPanel from '../sidebar/EntityPanel.jsx';
import ProjectList from '../sidebar/ProjectList.jsx';
import SettingsPanel from '../sidebar/SettingsPanel.jsx';
import SceneDetail from '../storyboard/SceneDetail.jsx';
import StoryboardGrid from '../storyboard/StoryboardGrid.jsx';

export default function AppLayout({
  sidebarTab,
  setSidebarTab,
  projectProps,
  settingsProps,
  chatProps,
  storyboardProps,
  sceneDetailProps,
  projectName,
  stats,
}) {
  return (
    <main className="sb-app">
      <aside className="sb-sidebar">
        <header className="sb-sidebar-header">
          <div className="sb-logo">◧</div>
          <strong>Storyboarder</strong>
        </header>

        <div className="sb-sidebar-tabs">
          <button
            className={sidebarTab === 'stories' ? 'active' : ''}
            onClick={() => setSidebarTab('stories')}
          >
            Stories
          </button>
          <button
            className={sidebarTab === 'entities' ? 'active' : ''}
            onClick={() => setSidebarTab('entities')}
          >
            Entities
          </button>
          <button
            className={sidebarTab === 'settings' ? 'active' : ''}
            onClick={() => setSidebarTab('settings')}
          >
            Settings
          </button>
        </div>

        <div className="sb-sidebar-scroll">
          {sidebarTab === 'stories' ? <ProjectList {...projectProps} /> : null}
          {sidebarTab === 'entities' ? <EntityPanel entities={sceneDetailProps.entities} /> : null}
          {sidebarTab === 'settings' ? <SettingsPanel {...settingsProps} /> : null}
        </div>
      </aside>

      <section className="sb-main">
        <header className="sb-main-header">
          <div>
            <h1>{projectName || 'Storyboarder'}</h1>
            <p>AI-assisted storyboarding with structured scene updates</p>
          </div>
          <div className="sb-stats">
            <article>
              <strong>{stats.scenes}</strong>
              <span>Scenes</span>
            </article>
            <article>
              <strong>{stats.characters}</strong>
              <span>Characters</span>
            </article>
            <article>
              <strong>{stats.locations}</strong>
              <span>Locations</span>
            </article>
          </div>
        </header>

        <StoryboardGrid {...storyboardProps} />
        <ChatPanel {...chatProps} />
      </section>

      <SceneDetail {...sceneDetailProps} />
    </main>
  );
}
