import { useMemo } from 'react';

export default function ProjectList({
  projects,
  activeProjectId,
  onSwitch,
  onCreate,
  onDelete,
  onRename,
}) {
  const ordered = useMemo(() => {
    const safe = Array.isArray(projects) ? projects : [];
    return [...safe].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  }, [projects]);

  return (
    <section className="sb-project-list">
      <header className="sb-section-head">
        <h3>Stories</h3>
        <button className="sb-btn sb-btn-primary" onClick={onCreate}>
          New
        </button>
      </header>

      <div className="sb-project-items">
        {ordered.map((project) => {
          const active = project.id === activeProjectId;
          return (
            <article key={project.id} className={`sb-project-item ${active ? 'active' : ''}`}>
              <button className="sb-project-main" onClick={() => onSwitch?.(project.id)}>
                <strong>{project.name}</strong>
                <span>{formatRelativeTime(project.updatedAt)}</span>
              </button>
              <div className="sb-project-actions">
                <button className="sb-btn sb-btn-xs" onClick={() => onRename?.(project)}>
                  Rename
                </button>
                <button className="sb-btn sb-btn-xs sb-btn-danger" onClick={() => onDelete?.(project.id)}>
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatRelativeTime(timestamp) {
  if (!timestamp) {
    return 'Unknown';
  }

  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) {
    return 'Just now';
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) {
    return `${diffH}h ago`;
  }

  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}
