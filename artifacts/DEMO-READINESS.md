# VISIST demo readiness — 16 November 2026

Build: `20261116-demo-ready`. Suitable for a local stakeholder demonstration; this is an interactive prototype.

## Verified

- Official uploaded `visist-ai-logo.png` is used unchanged, at its original aspect ratio, in desktop navigation and the mobile drawer.
- Website-matched emerald `#026B33` remains the primary brand colour. The supplied Spark, Scout, Star and Champ artwork loads intact.
- All 15 domain regression tests and module syntax checks pass.
- [61 workflow checks](demo-workflows.json), [12 after-refresh checks](demo-refresh.json) and [10 export/asset checks](demo-assets-export.json) pass: 83 browser assertions in total.
- Flows cover student creation/editing, search/filter/sort, profiles, curriculum/drills, assessment cycles, normal and baseline assessments, repeated failures/successes, badges, attendance corrections, role switching, fitness histories, notifications and saved-state refresh.
- CSV generation checked: eight Whitefield data rows match the selected filter; headers and simulated-date filename are correct.
- Local logo, level images and generated training photograph resolve. Photo is labelled illustrative. Main level collection artwork is distinct from individual skill awards.
- No browser JavaScript errors observed during the rehearsal. Tests used an isolated session; the user's browser records were not reset.

## Start the meeting

1. Run `npm start` from the project directory, or leave the existing local server running.
2. Open `http://127.0.0.1:4173/?v=demo-ready#dashboard` in a modern browser and refresh once. Use the same host/port throughout: browser-local data belongs to that origin.
3. Use Management for the opening overview. The original demo date is **13 November 2026**, deliberately simulated; the visible Demo date control can change it.
4. For clean records, use a fresh browser profile/session. Avoid resetting a session containing changes you want to keep.

## Suggested 6-minute walkthrough

1. **Dashboard:** show logo, filters and academy totals.
2. **Students → Arjun Sharma:** show player card, actual level artwork, collection counts, next challenge and four-level journey.
3. **Assess a skill:** choose an unearned skill, answer all five criteria and add remarks. A pass awards that individual skill, updates history and celebrates once. The default demonstration pass rule is 4/5.
4. **Attendance:** mark students, enter an observation and save. Switch to Head Coach to show the connected daily count.
5. **Curriculum:** open a reference skill, associated drill and checklist. Explain that the supplied PSB targets are the reference and the checklist is a demo adaptation.
6. **Reports:** filter a venue and export CSV. Refresh to show saved changes.

Optional: demonstrate Day Zero as separate baseline evidence, or a future cycle using its explicit date-preview confirmation.

## Boundaries to explain accurately

- Fictional people and records, browser-local persistence, simulated roles; no live backend or authentication.
- Training photo is generated; drill video panels remain placeholders.
- Four skills in one level make its collection ready for coach review; overall level promotion remains manual.
- Fitness units and the configurable assessment pass threshold are illustrative.
- Wide tables scroll horizontally on phones; desktop is the clearest presentation format.
- Keep the local server running. This build is ready for a prototype meeting, not a production rollout.

## Previews

[Desktop with official logo](demo-ready-desktop.png) · [Mobile logo drawer](demo-ready-mobile-logo.png)
