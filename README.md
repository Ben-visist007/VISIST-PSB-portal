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
- **Assessments:** plan a dated assessment, select its students and skill group, optionally include fitness, and record results from the saved assessment. Upcoming Fridays are scheduling suggestions; historical records keep their original dates and assignments.
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

## Assessment and badge rules

Each official skill assessment records five Yes/No criteria, coach remarks and a snapshot of its criteria, name and pass threshold. The default threshold remains four of five. Passing awards the individual skill badge once; repeat passes never inflate earned-badge totals. Baseline evidence remains separate from regular badge awards.

Overall level changes remain subject to head-coach review. Fitness measurements do not automatically award Spark or invent a fitness pass standard. The precise fitness prerequisite and skill/module/badge schema must be defined before those business rules change.

The progression chart counts cumulative unique skill badges from the earliest regular passing evidence per student and skill. Selected reporting windows retain the opening badge balance; repeat attempts and baseline results do not add awards. Chart drilldowns show the records supporting the displayed measure.

## Curriculum and media

The original sixteen skill records and official badge IDs remain stable. Custom library entries are training skills; curricula group selected library skills and batches connect students to those curricula. Custom content does not create extra official badge IDs or automatically modify academy progression rules.

The repository contains coaching photography and badge artwork, but no supplied drill video files. Video covers indicate unavailable content until a real media URL is configured. Text instructions remain available as supporting guidance. The application does not perform AI video scoring or send parent notifications; prepared notices are shared manually.

The official uploaded VISIST.AI and PSB logos retain their original artwork. `assets/psb-logo.png` is a byte-identical copy of `PSB .png`. The primary green matches VISIST's website: `#026B33`, with forest `#0D2D17` and lime `#A3E635`. Original Spark, Scout, Star and Champ artwork remains separate from the generated individual skill pins in `assets/skill-badges/`. The artwork mapping is documented in [the manifest](artifacts/skill-badge-assets.json).

## Structure and verification

- `index.html`, `styles.css`, `js/app.js`: application rendering, routing, forms and visual interactions.
- `js/data.js`, `js/state.js`, `js/domain.js`: initial records, browser storage, migration and recorded assessment rules.
- `js/operations.js`: coach assignments, curriculum/library/batch operations, group assessment creation and fitness steps.
- `js/planner.js`, `js/analytics.js`: practice recommendations, planning helpers and cumulative reporting.
- `js/curriculum.js`: official sixteen-skill targets and coaching guidance.
- `tests/`: unit regressions and isolated browser workflow suites.

Run `npm test` for domain and analytics checks, and `npm run check` for module syntax checks. Browser suites must run in their own isolated browser session because workflow checks may reset that session's local records. Older screenshots and QA documents describe earlier versions and are retained as historical artifacts.
