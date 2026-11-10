# November guide QA — 2026-11-10

`browser-audit.js` is an async Playwright function for the browser run-code tool. Run in an isolated browser context with the guide served at http://127.0.0.1:8765/. It clears test-context storage before running.

Latest run: **564 assertions passed**, zero JavaScript errors.

Coverage:
- Save/unsave and visited/unvisited controls on all 90 cards.
- All 60 actionable pickup toggles and duplicate-store synchronization. The 61st entry is the already-owned Montbell jacket and intentionally has no purchase toggle.
- All neighborhood/category filters, pickup types, edition scopes, and section toggles.
- Real pointer interactions, row-body purchase clicks, search/empty results, and persistence after reload.
- Map open/close, zoom controls, popup directions, 15 additional shop directions links, and keyboard destination disclosure.
- All 90 lead card images decoded and have dimensions larger than a placeholder; 390px and 1280px layouts have no horizontal overflow.

Additional session checks passed: legacy item and brand disclosure handlers, keyboard pickup-section disclosure, mocked geolocation success, and syntax validation of outgoing links. Photo contact sheets and mobile/desktop card screenshots were visually inspected.

Limits: external website uptime and real-device GPS permissions are not guaranteed by this audit. The 15 new physical shops have directions links in the map panel, not verified coordinate pins. Photo sources are recorded in photo-sources.json and linked from the cards. Food/product imagery is used on some cards.
