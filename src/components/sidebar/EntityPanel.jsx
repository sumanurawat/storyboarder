export default function EntityPanel({ entities }) {
  const characters = Array.isArray(entities?.characters) ? entities.characters : [];
  const locations = Array.isArray(entities?.locations) ? entities.locations : [];

  return (
    <section className="sb-entity-panel">
      <header className="sb-section-head">
        <h3>Entities</h3>
      </header>

      <div className="sb-entity-group">
        <h4>Characters</h4>
        {characters.length === 0 ? <p className="sb-hint">No characters yet.</p> : null}
        {characters.map((character) => (
          <article key={character.id} className="sb-entity-card">
            <div className="sb-entity-head">
              <span className="sb-entity-dot" style={{ background: character.color || '#8ab4f8' }} />
              <strong>{character.name}</strong>
            </div>
            <p>{character.description}</p>
            <small>{character.role}</small>
          </article>
        ))}
      </div>

      <div className="sb-entity-group">
        <h4>Locations</h4>
        {locations.length === 0 ? <p className="sb-hint">No locations yet.</p> : null}
        {locations.map((location) => (
          <article key={location.id} className="sb-entity-card">
            <div className="sb-entity-head">
              <strong>{location.name}</strong>
            </div>
            <p>{location.description}</p>
            <small>{location.mood}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
