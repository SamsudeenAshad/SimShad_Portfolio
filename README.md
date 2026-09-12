# Samsudeen Ashad — Portfolio

A static software engineering and AI portfolio. The existing HTML, CSS, JavaScript, public routes, local admin data and résumé are preserved.

[Public portfolio](https://samsudeenashad.github.io/SimShad_Portfolio/)

## Local preview

From this directory:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. There is no build step or package installation for the site.

## Main files

The current visual direction follows the supplied DEATHAR reference: burgundy, amber and cream, Manrope headings, Playfair Display italic accents, DM Mono labels, and restrained cinematic motion. `reference-theme.css` owns that styling; `reference-motion.js` adds a persistent session pause control and respects reduced-motion preferences. Existing content and data integrations remain in their original modules.

- `start/index.html`: the complete continuous portfolio: cinematic introduction, about, skills, all seven projects, career history, certifications, references and contact form. Navbar links scroll within this page.
- `start/profile.html`: compatibility redirect to `index.html`, preserving queries and section bookmarks. Old `#work` links resolve to `#projects`.
- `start/designs.html`: existing local design collection, filters and accessible previews.
- `about/samsudeen-ashad.html`: canonical biography and references.
- `start/assets/css/studio.css`: shared tokens, home layout and quick-navigation dialogs.
- `start/assets/css/profile-premium.css`: visual enhancements over the preserved profile stylesheet.
- `start/assets/js/core-scene.js`: native WebGL sculpture, still Canvas fallback and CSS fallback. Rendering pauses offscreen, in background tabs and for reduced motion.
- `start/assets/js/experience.js`: quick navigation (`Ctrl/Cmd + K`), reveals, scroll progress, local time, copy-email feedback and modal focus management.
- `start/assets/css/unified.css`: layout adjustments for the combined portfolio.
- `start/assets/js/portfolio-loader.js`: existing `portfolio_*` localStorage integration.

Project artwork is labeled as an interface concept. Historical GitHub figures retain their snapshot context. The contact form prepares an email draft in the visitor's email application; it has no server delivery backend. Admin and gallery data remain local to the current browser, as in the original site.

## Browser checks

The regression script uses an existing Playwright installation and Chrome; these are development tools only.

```sh
node tests/browser-smoke.cjs
```

The additional motion controls can be checked with `node tests/reference-motion.cjs`.

If Playwright is not resolvable in your environment, set `PLAYWRIGHT_MODULE_PATH` to its installation directory. `CHROME_PATH` and `BASE_URL` can also be overridden. Tests deliberately block external resources to verify that core content, navigation, the CV, local data and graphics fallbacks work independently of CDNs.

See [ENHANCEMENT-NOTES.md](ENHANCEMENT-NOTES.md) for the initial audit, strategy and validation notes.
