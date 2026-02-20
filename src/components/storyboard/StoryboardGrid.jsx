import ActRow from './ActRow.jsx';

export default function StoryboardGrid({ storyboard, selectedSceneId, onSelectScene }) {
  const acts = Array.isArray(storyboard?.acts) ? storyboard.acts : [];

  return (
    <section className="sb-board-grid">
      <header className="sb-section-head">
        <h2>Storyboard</h2>
        <p>Act → Sequence → Scene structure</p>
      </header>

      <div className="sb-board-acts">
        {acts.map((act) => (
          <ActRow
            key={act.number}
            act={act}
            selectedSceneId={selectedSceneId}
            onSelectScene={onSelectScene}
          />
        ))}
      </div>
    </section>
  );
}
