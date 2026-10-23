# Avinash Pauskar — Portfolio

A single-page portfolio built with plain HTML, CSS and JavaScript. There's no framework and no build step; the whole site is `index.html`.

## Live

**[avinash-pauskar.netlify.app](https://avinash-pauskar.netlify.app)**

## What's in it

The portfolio is an **infinite canvas**, like a Figma or Miro board.

- **Pan, zoom and pinch** around a board with zones for the intro, work, projects, hackathon wins, tech stack, learning and contact. Hand-drawn arrows connect the zones.
- **Guided tour.** An "Avinash" multiplayer-style cursor greets first-time visitors and can fly them through each zone with short notes.
- **Drag things around.** Project cards and hackathon sticky notes can be picked up and moved.
- **Figma-style chrome**: a toolbar that jumps to each zone, zoom controls, fit-to-screen, a minimap and a light/dark toggle.
- **Page view.** One click turns the canvas into a normal scrolling page, for recruiters and screen readers. Phones open in page view by default.
- Keyboard: `+`/`-` to zoom, `0` to fit everything, arrow keys to pan. It respects `prefers-reduced-motion`.

## Run locally

```bash
python -m http.server 5173
```

## Deploy

Push to the connected Netlify site, or deploy the folder with the Netlify CLI:

```bash
netlify deploy --dir . --prod
```

## License

MIT
