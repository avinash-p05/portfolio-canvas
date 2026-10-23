# Portfolio Canvas

My portfolio, laid out as an infinite canvas like a Figma or Miro board. Visitors pan and zoom around zones for my work, projects, hackathon wins and skills, while a multiplayer-style "Avinash" cursor keeps working on the board.

**Live:** [avinash-pauskar.netlify.app](https://avinash-pauskar.netlify.app)

[![CI](https://github.com/avinash-p05/portfolio-canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/avinash-p05/portfolio-canvas/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

## Features

- **Infinite canvas.** Pan, zoom and pinch with mouse, trackpad, touch or keyboard. Hand-drawn arrows connect each zone, and a minimap shows where you are.
- **Guided tour.** On a first visit the cursor says hello and can fly visitors through each zone.
- **A live collaborator.** The cursor retypes the status, comments on project cards, selects skills, circles highlights and nudges sticky notes, always near where the visitor is looking.
- **Follow mode.** Click the owner's avatar to follow the cursor around the board, like Figma's observation mode.
- **View-only visitors.** Cards are locked. Trying to move one opens a **Request edit access** dialog, which is delivered by email through Netlify Forms.
- **Page view.** One click turns the canvas into a normal scrolling page for recruiters and screen readers. Phones open in page view.
- Light and dark themes, and it respects `prefers-reduced-motion`.

## Make it yours

Everything on the canvas comes from one typed file: [`src/content/portfolio.ts`](src/content/portfolio.ts). Change the text, links, projects and positions there; the types in [`src/content/types.ts`](src/content/types.ts) document each field. You shouldn't need to touch any components.

1. Fork the repo and run it locally (see below).
2. Edit `src/content/portfolio.ts`. Positions are world coordinates in pixels, with the intro card near `(0, 0)`.
3. Replace `public/Avinash_Pauskar_Resume.pdf` with your résumé and update `person.resumeUrl`.
4. Update the title and description in `index.html`.
5. Deploy to Netlify (see below).

## Getting started

You'll need Node.js 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Start the dev server with hot reload        |
| `npm run build`     | Type-check and build to `dist/`             |
| `npm run preview`   | Serve the production build locally          |
| `npm run lint`      | Lint with ESLint                            |
| `npm run typecheck` | Type-check with TypeScript                  |
| `npm test`          | Run the unit tests with Vitest              |
| `npm run format`    | Format everything with Prettier             |
| `npm run check`     | Lint, type-check, test and check formatting |

## How it's built

React 18, TypeScript (strict) and Vite, with no UI or state libraries.

```text
src/
├── content/      portfolio data and its types; the only place to edit content
├── canvas/       the camera engine, the pannable board and canvas primitives
├── zones/        one component per zone: intro, work, projects, hackathons…
├── guide/        the "Avinash" cursor: tour, live activity and pen strokes
├── chrome/       fixed UI: header, toolbar, minimap, notices, request dialog
├── hooks/        theme and toast hooks
├── lib/          small helpers (storage, media queries, rich text)
└── styles/       global CSS, split by area
```

- **The camera lives outside React.** [`CanvasEngine`](src/canvas/engine.ts) is a framework-free class that owns the camera, fly animations and the cursor position. Components subscribe to it and write transforms straight to the DOM, so panning and flying never re-render the component tree. It is unit tested in [`engine.test.ts`](src/canvas/engine.test.ts).
- **The collaborator is plain async code.** [`guide/collaborator.ts`](src/guide/collaborator.ts) picks an action, moves the cursor and dispatches small state changes (status text, selections, pen strokes) through a reducer.
- **Edit requests use Netlify Forms.** Netlify only detects forms in static HTML, so `index.html` contains a hidden copy of the `edit-request` form. Keep its field names in sync with [`RequestAccessDialog.tsx`](src/chrome/RequestAccessDialog.tsx).

## Deploying

The site deploys to Netlify using [`netlify.toml`](netlify.toml) (`npm run build`, publishing `dist/`).

```bash
npx netlify-cli deploy --prod
```

For the request dialog to work, turn on form detection for the site in Netlify (**Forms → Enable form detection**) and add an email notification for new submissions.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Avinash Pauskar
