# Avinash Pauskar — Portfolio

A single-page portfolio built with plain HTML, CSS and JavaScript. There's no framework and no build step; the whole site is `index.html`.

## Live

**[avinash-pauskar.netlify.app](https://avinash-pauskar.netlify.app)**

## What's in it

- **Live topology hero.** An animated canvas of a payment system where requests flow from the gateway to payments, the ledger, Kafka and the services after it. Some are deduped or rejected along the way.
- **Payment playground.** An in-browser model of how FinCore handles money. Visitors can retry a payment with the same idempotency key, try to overdraw, or fire 50 concurrent payments, and watch the double-entry ledger stay balanced.
- **Command palette.** Press `Ctrl K` (or `⌘ K` on a Mac) to jump to sections, run playground actions, copy the email address or open links.
- Animated impact metrics, experience, featured and pinned projects, hackathon wins, skills, education and certifications.
- Responsive down to phone widths, and it respects `prefers-reduced-motion`.

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
