# Storyboarder Desktop (UI Mock V1)

Storyboarder is currently a desktop **clickable mock** focused on UX flow.

No backend calls or real AI generation are used in this version.

## What you can do now
- Chat in a copilot-style panel
- Paste a story idea and generate a dummy storyboard instantly
- See visual storyboard cards with dummy image frames
- Edit scene details in a scene inspector
- Reorder, add, and delete scenes
- Trigger random mock updates from chat

## Why this version exists
This build is for product and UX iteration first:
- lock layout and interaction model
- test story-to-storyboard workflow quickly
- postpone API/backend integration to the next phase

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run dist
```

## Notes
- Desktop dev uses fixed renderer port `4173`.
- If the app was showing blank before, that dev-launch issue has been fixed.
