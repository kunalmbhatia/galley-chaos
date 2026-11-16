# Contributing to Galley Chaos

Thanks for wanting to help. The most valuable contributions are **real cabin scenarios** from people who have lived them.

## Suggest a scenario (no coding needed)

Open a [new scenario issue](../../issues/new?template=new-scenario.md) and fill in:

1. **The situation**, in one sentence, as the crew would see it.
2. **The right response**, the way a trained crew member would actually handle it.
3. **Two wrong responses** that are funny but obviously wrong.
4. **When it happens:** climb, cruise or descent.

Keep it kind. The joke is the chaos, never a passenger's nationality, religion, body or disability.

## Report a bug

Open a [bug report](../../issues/new?template=bug-report.md) with your browser, device, the aircraft you were flying and what happened.

## Change the code

Everything lives in `game.js`. There is no build step.

- **Scenarios** are in the `SCENES` array: `{ e, kid, st, q, a, w }`.
- **PA announcements** are in `PA`.
- **Cart items** are in `ITEMS` and `ITEM_ORDER`; what passengers ask for is in `WANTS`.
- **Aircraft** are in `LEVELS`. Keep crew at one per 50 seats or more.

Open `index.html` in a browser to test, then send a pull request with a short description and a screenshot.

If you change `game.js`, bump `CACHE` in `sw.js` (for example `galley-chaos-v3` to `galley-chaos-v4`) so players get the new version.
