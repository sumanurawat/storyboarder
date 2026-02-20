# Storyboarder Architecture (Phase 1)

## High-Level
- Desktop shell: Electron
- UI: React (Vite)
- App state: Zustand stores
- Model backend: OpenRouter via OpenAI-compatible SDK
- Storage: Local JSON files through Electron IPC

## Runtime Flow
1. User sends message in chat.
2. App builds full system prompt with current storyboard/entities.
3. App calls OpenRouter streaming chat completion.
4. Response is parsed into:
- chat text
- structured update payload
5. Update payload mutates local storyboard/entities state.
6. Project is persisted as local JSON.
7. UI re-renders storyboard grid and entity registry.

## Persistence Model
- `settings.json`: API key + selected model
- `projects/<id>.json`: messages + storyboard + entities

## UI Regions
- Left: project list, entity panel, settings (tabbed)
- Center: storyboard act grid + chat
- Right: selected scene detail

## Future Phases
- Phase 2: scene image generation with entity-injected prompt composition
- Phase 3: cloud sync, collaboration, monetization, export pipeline
