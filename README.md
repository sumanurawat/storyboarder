# Storyboarder Desktop

Storyboarder is a desktop AI storyboarding app.

Phase 1 includes:
- OpenRouter BYOK settings
- model selector from OpenRouter models API
- chat-driven storyboard updates
- Act -> Sequence -> Scene grid
- character/location entity registry
- local project persistence via Electron JSON storage

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run dist
```

## Setup
1. Open Settings tab.
2. Paste OpenRouter API key (`sk-or-...`).
3. Refresh/select model.
4. Start chatting in Conversation panel.

## Saved Plan & Prompt
- Phase plan: `/Users/sumanurawat/Documents/GitHub/storyboarder/plans/PHASE1_PLAN.md`
- Architecture: `/Users/sumanurawat/Documents/GitHub/storyboarder/plans/ARCHITECTURE.md`
- Prompt doc: `/Users/sumanurawat/Documents/GitHub/storyboarder/prompts/STORYBOARD_SYSTEM_PROMPT.md`
- Runtime prompt template in code: `/Users/sumanurawat/Documents/GitHub/storyboarder/src/prompts/system-prompt.js`
