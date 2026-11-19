# VISIST-PSB-portal

A browser-based VISIST × Padukone School of Badminton academy portal focused on assessment planning, individual skill badges, practice recommendations and student progression. The official four levels remain Spark, Scout, Star and Champ, with sixteen beginner skill badges based on page 1 of the supplied PSB reference.

## Run locally

```sh
npm start
```

Open **http://127.0.0.1:4173**. Python 3 and a modern browser are required; no package installation or build is needed. Serve the project over HTTP because the application uses JavaScript modules.

If startup reports `Address already in use`, another server is already using port 4173. Check whether the portal is already open there before starting another process.

## Main workflows

- **Dashboard:** scoped student and badge totals, upcoming assessments, interactive cumulative badge progression and venue/level comparisons.
- **Students:** profiles, current levels, individual badge collections and assessment history. Use **Add to assessment** to place a player into an upcoming group assessment.
- **Assessments:** plan a dated assessment, select its students and skill group, optionally include fitness, and record the received participant clearance result from the saved assessment. Upcoming Fridays are scheduling suggestions; historical records keep their original dates and assignments.
- **Practice plan:** group assigned students by incomplete skills and open relevant coaching materials. Recommendations work without a daily register.
- **Curriculum / Coach Toolkit:** official skill targets and drills, video covers and supporting instructions. Assistant coaches see only content relevant to their assigned students.
- **Coaches:** create coaches, assign their venues and move students between appropriate coaching assignments. Head coaches oversee their assigned venues; assistant coaches work with explicitly assigned students.
- **Custom curricula and batches:** select skills from the library, create training curricula and assign student batches. These training structures remain separate from official badge awards.
- **Fitness:** available inside Assessments, preserving measurement history and comparisons. Linked fitness steps use the scheduled assessment's student and date.
- **Reports:** filter student progression and badge information, inspect the corresponding records and export a CSV summary.

Daily attendance tracking, attendance-based assessment restrictions, standalone student-profile skill assessments, the dedicated reassessment screen and the standalone fitness navigation item have been retired. Unfinished or unsuccessful skills feed the next regular assessment recommendation, with prior outcomes retained in history.

## Roles and persistence

Management sees the academy. Head coaches see students at the venues they oversee, including multiple venues where assigned. Assistant coaches see their explicitly assigned students and relevant curriculum. View switching and UI restrictions support local review; this application has no backend authentication or server-enforced authorization.

Records are saved in this browser under `visist-demo-v1`. Existing workspaces migrate without resetting student records, badge collections, assessment history, planned assessments or fitness measurements. Retired register data and drafts are no longer part of active state. The workspace date controls reporting and assessment entry; future assessment execution requires explicit confirmation before advancing it.

## Dashboard teaching suggestions

**Suggested teaching groups** appears on Dashboard before the reporting cards. Select a coach, venue or mixed training batch to see which students can practise together and what to teach. Recommendations use assigned, enrolled students and their earliest incomplete badge collection, without a daily register.

Within each venue and working collection, the planner chooses the missing skill shared by the most remaining students, assigns those students to one primary teaching group, then repeats. Support needs break ties before curriculum order. A student's current overall level is preserved; the shared practice focus can address foundation gaps. Different physical venues never become one recommended teaching group.

The compact preview includes one priority focus from each available collection, then fills spare slots. **Show all groups** reveals the full set, and **View group** exposes every student and their profile. Targets and teaching guidance come from the existing curriculum; **Open drill** opens its actual coaching content. Reporting date-range filters do not remove students from teaching suggestions.

Students with all sixteen badges stay visible under **Continued practice**, with access to their selected batch training or Coach Toolkit. These suggestions do not prescribe session durations, court assignments or badge awards.

Verified with 66 unit tests and 114 browser assertions, including 26 dedicated teaching-group checks. [Desktop preview](artifacts/teaching-desktop.png) · [Mobile preview](artifacts/teaching-mobile.png) · [Group details](artifacts/teaching-group.png).

## Assessment clearance, badges and levels

The assessment portal supplies each participant's assessment result. **Cleared** automatically awards all badges linked to that participant's assessment and updates level progress. **Not cleared** awards no badges. There are no new questionnaire responses, numeric pass thresholds, required coach comments or separate badge approvals.

Creation displays the linked badge collection explicitly. The sixteen collectible badge IDs remain stable. Each assessment retains its module identifier and versioned local badge-mapping snapshot; each received result retains its source result/report reference and the linked badge names. These local `PSB_LOCAL_*` mappings are not represented as the deployed assessment portal's API catalog.

`recordAssessmentClearance` in `js/progression.js` is the shared integration adapter. It accepts the explicit participant clearance outcome, validates the scheduled assessment, participant, date and linked IDs, records evidence, and awards badges in one local transaction. Source result references make duplicate delivery idempotent. Source upload, processing, report-generation or `ASSESSMENTS_COMPLETE` states are operational progress and never imply athletic clearance. The local interface records an already-issued result; no external assessment API or evaluator is connected or simulated.

Badges unlock the ordered four-level path automatically: badges 1–4 unlock Scout; 1–8 unlock Star; 1–12 unlock Champ. Spark is the starting level, and collecting all sixteen completes the Champ collection without inventing a fifth level. Foundation gaps prevent level skipping. Previously saved levels are retained and never demoted. Later unsuccessful results do not silently revoke earned badges.

Historical five-response assessments and baseline evidence remain read-only as originally recorded. New regular or baseline questionnaire scoring is retired. Onboarding uses the assessment roster. Fitness measurements remain supporting evidence; an explicitly received clearance result awards only the badges actually linked to that fitness assessment.

The progression chart counts cumulative unique badge awards, combining preserved historical passing evidence with new clearance award evidence. Duplicate result delivery and repeated clearances do not inflate badge totals. Assessment-result lists and counters show one participant clearance event even when that event awards several badges. Selected reporting windows retain the opening badge balance.

## Curriculum and media

The original sixteen skill records and official badge IDs remain stable. Custom library entries are training skills; curricula group selected library skills and batches connect students to those curricula. Custom content does not create extra official badge IDs or automatically modify academy progression rules.

The repository contains coaching photography and badge artwork, but no supplied drill video files. Video covers indicate unavailable content until a real media URL is configured. Text instructions remain available as supporting guidance. The application does not perform AI video scoring or send parent notifications; prepared notices are shared manually.

The official uploaded VISIST.AI and PSB logos retain their original artwork. `assets/psb-logo.png` is a byte-identical copy of `PSB .png`. The primary green matches VISIST's website: `#026B33`, with forest `#0D2D17` and lime `#A3E635`. Original Spark, Scout, Star and Champ artwork remains separate from the generated individual skill pins in `assets/skill-badges/`. The artwork mapping is documented in [the manifest](artifacts/skill-badge-assets.json).

## Structure and verification

- `index.html`, `styles.css`, `js/app.js`: application rendering, routing, forms and visual interactions.
- `js/data.js`, `js/state.js`, `js/domain.js`: initial records, browser storage, migration and recorded assessment rules.
- `js/operations.js`: coach assignments, curriculum/library/batch operations, group assessment creation and fitness steps.
- `js/progression.js`: assessment-clearance receipts, automatic linked-badge awards and ordered level unlocks.
- `js/planner.js`, `js/analytics.js`: practice recommendations, planning helpers and cumulative reporting.
- `js/curriculum.js`: official sixteen-skill targets and coaching guidance.
- `tests/`: unit regressions and isolated browser workflow suites.

Run `npm test` for domain and analytics checks, and `npm run check` for module syntax checks. Browser suites must run in their own isolated browser session because workflow checks may reset that session's local records. Older screenshots and QA documents describe earlier versions and are retained as historical artifacts.

The clearance revision passed **58 unit checks** and **88 browser assertions** (41 workflows, 16 planner/fitness, 9 persistence and 22 chart checks). See [the clearance QA record](artifacts/QA.md) and [automatic badge result preview](artifacts/clearance-result.png).
