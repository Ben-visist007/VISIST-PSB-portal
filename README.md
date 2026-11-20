# VISIST × Padukone School of Badminton

The workspace follows the supplied **psb-skill-badges.html** for its workflows, terminology, role menus, seeded data, assessment scoring, progression and simulator. VISIST’s green, dark sidebar, official partner logos, existing coaching photography, original level artwork and individual badge images remain the visual identity.

## Run

```sh
npm start
```

Open **http://127.0.0.1:4173/**. Python 3 and a modern browser are required. No installation or build step is needed. If port 4173 is occupied, check whether the portal is already running there.

## Workspace behaviour

- **Academy account:** Academy overview, Players, Coaches & venues, Assessment planner, Curriculum & rules, Skill mapping and Settings.
- **Head coach:** Academy overview, Players, Coaches & venues and Assessment planner; sees every player across venues and can reassign coaches inline.
- **Coach:** My players, Day plan and Assessment planner; works with assigned players and can add a player within their own scope.
- **Player intake:** the reference’s simple form with optional parent WhatsApp. New players start at Spark with zero skill badges.
- **Profiles:** Badge board, History and Family view (phase 2), including per-video scores, best scores, attempt history, direct booking and simulated family sharing. Selecting a badge opens its full skill detail; Back restores the player profile and badge focus.
- **Curriculum:** responsive badge collections with the official teaching standards and assessment checklists in accessible detail dialogs.
- **Overview:** metrics, coach bars and badge bottlenecks open scoped player or award records; next assessment planning is directly accessible.
- **Day plan:** retains the present/absent selection, but groups players by their next unearned skill badge, irrespective of current level. Each present player has one primary badge focus; completed collections remain visible for continued practice. This is the approved exception to the HTML’s level-based grouping. Badge artwork and titles open the teaching standard and assessment checklist.
- **Planner:** fixed monthly level days, Recommended, Stretch / fast-track, Add all, automatic or manual booking and the fixed recording sequence. **Record & score** immediately scores the booked group, advances the workspace clock if needed, locks the recorded day and opens the complete **AI scoring complete** result view.
- **Awards:** follow the reference’s per-video scores and best-score accumulation. The default ordered-column rule and alternative count rule behave exactly as in the HTML.
- **Settings:** ordinal weekday per level, fifth-week policy, roster mode and notice period apply immediately.
- **Skill mapping:** library skills → editable skill sets → badge columns, including drag/drop, renaming, remapping and New skill set.

The previous manual Cleared/Not cleared form, result references, separate booked-assessment management, fitness workflow, rescheduling dialogs, custom curricula/batches, Reports and isolated simulation workspace are **not part of the active UI**. The latest instruction to follow the entire HTML supersedes the earlier exceptions.

## Event simulator and scenarios

The simulator is a **non-modal side panel** operating on the same workspace. Its Assessment result, Onboard, Rules and Event log tabs retain the reference controls and wording: AI-score sliders, Re-roll, All pass, Submit to AI scoring, prior skill, placement, threshold replay and count/column rule comparison.

**Seeded academy** uses the source’s eighteen players and their assessment history. **4-athlete dry run** uses Aarav Kumar, Diya Nair, Kabir Singh and Myra Reddy. The reference fixture clock starts on **17 November 2026** and advances through assessment events. Closing the simulator retains changes in the current workspace.

All scores, video playback placeholders and family-sharing actions are simulated, as in the supplied HTML. There is no external evaluator, messaging service, authentication or server database.

## Storage

The workspace uses the reference’s **in-memory state**. Reloading restores the seeded academy and default settings, while keeping the selected account in the current browser tab via a separate session-storage preference. Scenario changes replace workspace data as in the reference; library/mapping edits follow the reference’s shared runtime configuration.

Previously saved portal records under `visist-demo-v1` are **neither loaded nor overwritten**. The former modules remain in the repository for historical comparison and compatibility checks; `index.html` does not load them.

## Active files

- `index.html`: VISIST shell and source-compatible DOM.
- `js/workspace.js`: the reference controller, with output escaping, the approved presentation interactions and adapters for existing artwork, photography and mobile navigation.
- `workspace-reference.css`: reference component structure.
- `workspace-skin.css`: VISIST visual identity and responsive adaptations.
- `reference/psb-skill-badges.html`: unchanged copy of the supplied source; SHA-256 `e7f0b7565d7a38bdd6ea5b5291ba6a1e538d8458f6841d49a06232100e4fce65`.

## Validation

```sh
npm run check
npm test
```

`tests/workspace-parity.test.js` compares the active core functions, seeded state, role scopes, unchanged management wording, calendar, scoring, rule replay and family-sharing ledger against the supplied HTML. It also checks that legacy browser storage is unused and user-authored names render safely. The earlier domain tests remain as compatibility checks for inactive code.

The active browser suites are `tests/browser-workspace.js`, `tests/browser-workspace-after-refresh.js`, `tests/browser-workspace-responsive.js`, `tests/browser-day-badges.js` and `tests/browser-experience.js`. Run them only in an isolated browser session. The other browser scripts describe the retired controller and are not acceptance tests for this workspace.

Latest verification: **112 unit/compatibility checks** (14 source-parity/presentation checks, 5 badge-grouping checks and 93 retained compatibility checks) and **398 active browser assertions** passed. Coverage includes full workflows, reload/storage behaviour and every role destination, profile/family view and simulator tab at 1440, 900 and 390 pixels, plus all sixteen curriculum pop-ups, keyboard focus, record drilldowns and profile return at desktop/mobile sizes.
