export default function SceneCard({ scene, actColor, isSelected, onSelect }) {
  return (
    <article
      className={`sb-scene-card ${isSelected ? 'active' : ''}`}
      onClick={() => onSelect?.(scene.id)}
      title={scene.storyFunction || scene.mood || scene.title}
    >
      <div className="sb-scene-number" style={{ color: actColor }}>
        SC {scene.sceneNumber || scene.id}
      </div>
      <div className="sb-scene-thumb" style={{ borderColor: `${actColor}55` }}>
        <span>🎬</span>
      </div>
      <strong>{scene.title}</strong>
      <p>{scene.location || scene.mood || 'No location yet'}</p>
    </article>
  );
}
