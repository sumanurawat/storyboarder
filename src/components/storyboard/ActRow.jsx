import SceneCard from './SceneCard.jsx';

const ACT_COLORS = ['#4A90D9', '#D94A4A', '#4AD97A'];

export default function ActRow({ act, selectedSceneId, onSelectScene }) {
  const color = ACT_COLORS[(Number(act?.number || 1) - 1) % ACT_COLORS.length];

  return (
    <section className="sb-act-row">
      <header className="sb-act-head">
        <div className="sb-act-color" style={{ background: color }} />
        <h4>
          Act {act.number}: {act.title}
        </h4>
      </header>

      <div className="sb-act-scroller">
        {act.sequences.map((sequence) => {
          if (!Array.isArray(sequence.scenes) || sequence.scenes.length === 0) {
            return (
              <div key={`empty_${sequence.number}`} className="sb-empty-seq" style={{ borderColor: `${color}55` }}>
                <span>+</span>
                <small>{sequence.title}</small>
              </div>
            );
          }

          return sequence.scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              actColor={color}
              isSelected={selectedSceneId === scene.id}
              onSelect={onSelectScene}
            />
          ));
        })}
      </div>
    </section>
  );
}
