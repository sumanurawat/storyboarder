export default function SceneDetail({ scene, entities, onClose }) {
  const characters = Array.isArray(entities?.characters) ? entities.characters : [];
  const locations = Array.isArray(entities?.locations) ? entities.locations : [];

  if (!scene) {
    return (
      <aside className="sb-scene-detail">
        <header className="sb-section-head">
          <h3>Scene Detail</h3>
        </header>
        <p className="sb-hint">Select a scene card to inspect full details.</p>
        <StoryConstants characters={characters} locations={locations} />
      </aside>
    );
  }

  return (
    <aside className="sb-scene-detail">
      <header className="sb-scene-detail-head">
        <h3>{scene.title}</h3>
        <button className="sb-btn sb-btn-xs" onClick={onClose}>
          Close
        </button>
      </header>

      <div className="sb-scene-meta">{scene.sceneNumber}</div>
      <div className="sb-scene-location">{scene.location || 'No location set'}</div>

      <Detail label="Time" value={scene.time} />
      <Detail label="Visual" value={scene.visualDescription} />
      <Detail label="Action" value={scene.action} />
      <Detail label="Mood" value={scene.mood} />
      <Detail label="Story Function" value={scene.storyFunction} />
      <Detail label="Dialogue" value={formatDialogue(scene.dialogue)} />

      <section className="sb-scene-characters">
        <h4>Characters</h4>
        <div className="sb-tag-row">
          {(scene.characterIds || []).map((id) => {
            const character = characters.find((item) => item.id === id);
            const label = character?.name || id;
            return (
              <span className="sb-tag" key={id}>
                {label}
              </span>
            );
          })}
          {(scene.characterIds || []).length === 0 ? <span className="sb-hint">No characters linked</span> : null}
        </div>
      </section>

      <StoryConstants characters={characters} locations={locations} />
    </aside>
  );
}

function Detail({ label, value }) {
  return (
    <section className="sb-detail-block">
      <h4>{label}</h4>
      <p>{value || '—'}</p>
    </section>
  );
}

function formatDialogue(dialogue) {
  if (!Array.isArray(dialogue) || dialogue.length === 0) {
    return 'No dialogue';
  }
  return dialogue.map((line) => `${line.character}: "${line.line}"`).join('\n');
}

function StoryConstants({ characters, locations }) {
  const safeCharacters = Array.isArray(characters) ? characters : [];
  const safeLocations = Array.isArray(locations) ? locations : [];

  return (
    <section className="sb-constants">
      <h4>Story Constants</h4>

      <details className="sb-constants-group" open>
        <summary>Characters ({safeCharacters.length})</summary>
        {safeCharacters.length === 0 ? (
          <p className="sb-hint">No characters tracked yet.</p>
        ) : (
          <div className="sb-constants-list">
            {safeCharacters.map((character) => (
              <article className="sb-constants-item" key={character.id}>
                <div className="sb-constants-item-head">
                  <span className="sb-constants-dot" style={{ background: character.color || '#8ab4f8' }} />
                  <strong>{character.name}</strong>
                </div>
                <p>{character.description || 'No description yet.'}</p>
              </article>
            ))}
          </div>
        )}
      </details>

      <details className="sb-constants-group" open>
        <summary>Locations ({safeLocations.length})</summary>
        {safeLocations.length === 0 ? (
          <p className="sb-hint">No locations tracked yet.</p>
        ) : (
          <div className="sb-constants-list">
            {safeLocations.map((location) => (
              <article className="sb-constants-item" key={location.id}>
                <div className="sb-constants-item-head">
                  <strong>{location.name}</strong>
                </div>
                <p>{location.description || 'No description yet.'}</p>
              </article>
            ))}
          </div>
        )}
      </details>
    </section>
  );
}
