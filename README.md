# Bhagi

An interactive story about Bhagi's years in the UK, told in 11 short chapters.
Built with React Router (data router), D3 and Vite.

## Run it

```bash
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

## How it's put together

- `src/main.jsx` sets up the routes: `/` (cover), `/chapter/:n` (1–11) and `/finale`.
- `src/story/stops.js` holds each chapter's title and text. Edit the words here.
- `src/story/scenes.js` has the D3 scene for every chapter, plus the cover and the closing heart.
- `src/components/Trail.jsx` is the journey trail at the top; `Scene.jsx` mounts a chapter's scene.

Swipe, tap "Keep reading", or use the arrow keys / space bar to move through the story.
