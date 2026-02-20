# Storyboarder Phase 1 Plan (Implemented Target)

## Goal
Ship a first real version of Storyboarder with:
- OpenRouter BYOK model access
- persistent local projects
- chat + structured storyboard updates
- act/sequence/scene UI with scene detail and entity registry

## Scope
1. Settings panel for OpenRouter API key + model selection.
2. OpenRouter model discovery (`/models`) and chat completion streaming.
3. Strict JSON update contract from assistant:
- `chat`
- `updates.scenes_add`
- `updates.scenes_update`
- `updates.scenes_remove`
- `updates.characters_add`
- `updates.characters_update`
- `updates.locations_add`
- `updates.locations_update`
4. State stores with Zustand:
- settings store
- project store
5. Project persistence via Electron IPC to local JSON files.
6. Storyboard structure model:
- 3 acts
- 8 sequence framework
- scenes with visual/action/dialogue/story function fields
7. UI layout:
- left sidebar (Stories / Entities / Settings tabs)
- center main (Storyboard + Conversation)
- right panel (Scene Detail)

## Build Order
1. Data model (`src/types/storyboard.js`).
2. System prompt + state injection (`src/prompts/system-prompt.js`).
3. OpenRouter client service (`src/services/openrouter.js`).
4. Parser + update applier (`src/services/prompt-builder.js`).
5. Storage abstraction (`src/services/storage.js`).
6. Electron IPC storage bridge (`electron/main.cjs`, `electron/preload.cjs`).
7. Zustand settings + project stores.
8. Componentized UI and App wiring.
9. Validation (`npm run lint`, `npm run build`, `npm run dev`).

## Storage
- Electron user data root: `app.getPath("userData")/storyboarder-data`
- Settings file: `settings.json`
- Projects folder: `projects/<project-id>.json`

## Notes
- Keep image/video generation out of Phase 1.
- Keep prompt/schema strict to minimize merge ambiguity.
- Reuse character/location IDs so future visual generation stays consistent.
