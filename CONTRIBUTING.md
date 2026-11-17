# Contributing to PixelForge

PixelForge is a small, dependency-free photo editor. Contributions are welcome — here's how the project stays coherent.

## Setup

```bash
git clone https://github.com/iamkorvynn/pixelforge
cd pixelforge
npm start        # http://localhost:4173 — no install step, no dependencies
```

## Rules

- **No dependencies.** The app is vanilla JS + canvas. Do not add a framework, bundler, or library without discussing it first.
- **Core stays pure.** Anything in `js/core/` and `js/filters/` must not touch the DOM, so it stays unit-testable in Node. UI code lives in `js/ui/`.
- **One filter per file.** A new filter is a new module in `js/filters/` with `id`, `label`, `description`, and `apply(buffer, strength?)`, registered in `js/filters/index.js`, with tests in `tests/filters.test.js`.
- **Presets are data.** A new preset pack is a data file in `js/presets/` using only known filter ids and adjustment keys.
- **Recipes are a contract.** The recipe format (`docs/recipes.md`) is versioned. Never change v1 semantics; add a new version instead.
- **Tests for logic, not for wiring.** Every new pure function gets a test. Run `npm test` before pushing.
- **Small commits.** One file or one feature per commit, with a message that says what changed and why.

## Verification

```bash
npm test                  # unit tests
npm run build             # syntax + asset + recipe checks
npm run smoke             # serves the app and checks it loads
python3 scripts/verify-all-recipes.py   # every bundled recipe on a real sample
```

All four must pass before a PR is merged.
