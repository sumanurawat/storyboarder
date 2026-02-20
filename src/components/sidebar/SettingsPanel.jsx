import { useState } from 'react';

export default function SettingsPanel({
  apiKey,
  model,
  models,
  isLoadingModels,
  modelError,
  onSaveApiKey,
  onModelChange,
  onRefreshModels,
}) {
  const [draftApiKey, setDraftApiKey] = useState(apiKey || '');

  return (
    <section className="sb-settings-panel">
      <header className="sb-section-head">
        <h3>Settings</h3>
      </header>

      <label className="sb-label">OpenRouter API Key</label>
      <div className="sb-row">
        <input
          type="password"
          value={draftApiKey}
          onChange={(event) => setDraftApiKey(event.target.value)}
          placeholder="sk-or-..."
        />
        <button
          className="sb-btn"
          onClick={() => onSaveApiKey?.(draftApiKey)}
          title="Save API key locally for this desktop app"
        >
          Save
        </button>
      </div>

      <label className="sb-label">Model</label>
      <div className="sb-row">
        <select value={model || ''} onChange={(event) => onModelChange?.(event.target.value)}>
          {Array.isArray(models) && models.length > 0 ? (
            models.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))
          ) : (
            <option value={model || ''}>{model || 'No models loaded'}</option>
          )}
        </select>
        <button className="sb-btn" onClick={onRefreshModels} disabled={isLoadingModels}>
          {isLoadingModels ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {modelError ? <p className="sb-error">{modelError}</p> : null}
      <p className="sb-hint">OpenRouter gives access to multiple providers with one key.</p>
    </section>
  );
}
