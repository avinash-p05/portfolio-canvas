# Contributing

Thanks for taking a look! Bug reports, ideas and pull requests are all welcome.

## Reporting a bug or suggesting an idea

Open an issue with what you expected, what happened, and your browser and device. A screenshot or screen recording helps a lot for anything visual.

## Making a change

1. Fork the repo and create a branch from `master`.
2. Install dependencies with `npm install` and start the dev server with `npm run dev`.
3. Make your change. Keep pull requests focused on one thing.
4. Run `npm run check`. It lints, type-checks, runs the tests and checks formatting, the same as CI. `npm run format` fixes formatting.
5. Open a pull request describing what changed and why. Include before/after screenshots for visual changes.

## Code style

- TypeScript in strict mode. Avoid `any`; describe data with types in `src/content/types.ts` or next to the code that uses it.
- Content belongs in `src/content/portfolio.ts`, not in components.
- Keep per-frame work (panning, flying, cursor movement) in `CanvasEngine` or in effects that write to the DOM directly, not in React state.
- Prettier formats the code and ESLint enforces the React hooks rules. Don't disable a rule without a comment explaining why.
- Add or update tests in `src/**/*.test.ts` when you change engine or geometry logic.
- Check that the canvas still works with touch, keyboard and `prefers-reduced-motion`, and that page view still reads well on a phone.
