# Test report

**Executed:** 2026-10-12 with Node v24.21.0. The scenario suite reported `PASS 7 groups`.
**Browser:** Playwright 1.64.0 with headless Chromium 156.0.8078.4.

| # | Criterion | Evidence | Status |
|---|---|---|---|
| 1 | B2B request + validation | Scenario validation group passed; browser submitted the prefilled 500 kg Tomato, grade A request | PASS |
| 2 | Multi-farmer matching | Scenario and browser checks confirmed 150 + 150 + 200 kg across Farms A, B and C (500 kg total) | PASS |
| 3 | Reservation safety | Scenario checks cover over-allocation, negative quantities, repeated confirmation, competing requests and cancellation | PASS (single browser only) |
| 4 | Shared state | Browser showed Farm A's 150 kg commitment after buyer confirmation | PASS |
| 5 | B2C commerce | Scenario suite passed cart limits, checkout totals, stock reduction and empty-cart checks | PASS |
| 6 | Persistence + reset | Browser reset restored 2 seeded requests, 10 lots, no orders, and zero reserved/delivered quantities | PASS |
| 7 | Static file serving | `/`, both CSS files, all three JS modules and the logo each returned HTTP 200 | PASS |
| 8 | Browser diagnostics | The walkthrough completed with no console errors or failed requests | PASS |
| 9 | GitHub Pages deployment | Not published or remotely verified. Configure Pages to deploy from `main` / `/(root)` in repository settings | UNVERIFIED |
| 10 | Honest representation | Source labels the data fictional and explicitly disclaims Kheyti integration or partnership | PASS (inspection) |

**Syntax:** `node --check` passed for temporary `.mjs` copies of each file in `js/`, and for `tests/scenario.test.mjs`.

**Known limitations:** Location feasibility is not part of matching; delay alerts, an exception queue, consumer location selection, product images, real payments/logistics/quality data and market intelligence are not implemented. Production reservation safety requires a transactional backend.
