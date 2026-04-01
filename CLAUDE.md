# CLAUDE.md — weylint.github.io

Helper tools for the **White Tiger** server in the game [Eco](https://play.eco).

## Project structure

No build system. Plain HTML files with inline `<script>` tags, served via GitHub Pages.

| File | Purpose |
|------|---------|
| `dinnerparty.html` | Dinner party recipe helper |
| `meteorstore.html` | Meteor store buying offers viewer (uses Chart.js) |
| `transport.html` | Transport profit calculator |
| `laws.html` | Ingame law list — Eco markup renderer, collapsible full law text |
| `law-view.html` | Single-law detail page (`?id=XXXXX`), linked from laws.html |
| `custom-stats.html` | Overview of custom stats written/read across all laws |
| `nav.js` | Shared left-nav sidebar injected on every page |
| `white-tiger-api.js` | Shared API module — `WhiteTigerAPI.fetchRecipes()` / `.fetchStores()` / `.fetchAllItems()` |
| `eco-render.js` | Shared rendering helpers (store name HTML, color tags) |
| `transport-algo.js` | Pure transport profit algorithm (no DOM, no API calls) |
| `docs/api-stores.md` | API reference for the `/stores` endpoint |
| `docs/api-recipes.md` | API reference for the `/recipes` endpoint |
| `docs/api-allItems.md` | API reference for the `/allItems` endpoint |
| `docs/api-laws.md` | API reference for the `/laws` and `/laws/{id}` endpoints |
| `tests/*.html` | In-browser test pages for the corresponding `.js` module |

## APIs

### EcoPriceCalculator (economy pages)

Base URL: `https://white-tiger.play.eco/api/v1/plugins/EcoPriceCalculator`

Include before the page's inline `<script>`:
```html
<script src="white-tiger-api.js"></script>
<script src="eco-render.js"></script>
```

### Laws (law pages)

Base URL: `https://white-tiger.play.eco/api/v1/laws`

Used directly (no shared module). See `docs/api-laws.md`.

## Design system

All pages use the same dark GitHub-style theme.

| Role | Value |
|------|-------|
| Font | `'Consolas', 'Menlo', 'Monaco', monospace` |
| Page background | `#0d1117` |
| Card/panel background | `#161b22` |
| Elevated surface | `#21262d` |
| Border | `#30363d` |
| Hover surface | `#1c2128` |
| Body text | `#c9d1d9` |
| Secondary text | `#8b949e` |
| Accent / heading | `#58a6ff` |
| Success / positive price | `#3fb950` |
| Neutral / zero | `#6e7681` |
| Danger / error | `#f85149` |
| Danger border | `#6e3030` |

**Component patterns:**
- Cards: `background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px`
- Buttons: ghost style — `background: none; border: 1px solid #30363d; color: #8b949e` — hover shifts border/text to the relevant accent color
- Tables: `th` on `#0d1117`, row divider `#21262d`, hover `#1c2128`
- Accent panels (summary boxes, debug): `border-left: 3px solid <accent>; background: #0d1117`

## Conventions

- Keep JS logic inside the HTML file unless it is genuinely reusable across pages — then extract it to a shared `.js` module.
- Pure algorithms go in their own `.js` file with a matching `.test.html` in-browser test page.
- Do not introduce a build tool, bundler, or npm.
- `eco-render.js` must sanitise all Eco `<color>` tags before inserting into the DOM (XSS prevention).
