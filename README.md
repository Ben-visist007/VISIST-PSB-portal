# VISIST-PSB-portal

A local, dependency-free HTML/CSS/JavaScript stakeholder demonstration. People and records are fictional. The 16 skill names and targets follow page 1 of the user-supplied PSB gamified PDF; coach checklists and practice instructions are demo adaptations. Fitness units and pass thresholds remain illustrative. There is no backend, authentication service, database, or connected academy media.

## Run locally

From this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open **http://127.0.0.1:4173**. Use a modern browser. A local web server is required for JavaScript modules; opening `index.html` directly using `file://` will not work reliably. No package installation or build is needed.

## Suggested demonstration journey

1. Open **Dashboard**. Change venue, level, and date range filters to see connected analytics. The default simulated date is 13 November 2026. Use the visible Demo date control to change it. Upcoming cycles offer an explicit Preview & assess action that confirms using their fixed date before execution, keeping dashboard reporting consistent.
2. Open **Students**, add a student, search for their name, open the profile, and edit their personal information. New students start at Spark. Profile tabs expose personal details, assessment history, attendance, and the 16-badge map.
3. Open **Curriculum**. Open any sample skill to see criteria, associated drill, and foundational prerequisites. Edit its sample content and see those changes in Coach Toolkit and assessment forms.
4. Open **Assessments → Create cycle**. Choose a fixed date, check students, and select different modules for each. The multi-select supports Ctrl/Command to choose multiple modules. Open the cycle and record an outcome for an assigned module.
5. Submit all five Yes/No responses with coach remarks. The default illustrative pass rule is 4/5; change it in Settings. Passing a regular assessment awards the individual skill badge and updates connected profiles and reporting. An unsuccessful attempt remains in the history and attention views; repeated attempts remain visible.
6. Open **Day Zero baseline** from Assessments. Select a student and multiple relevant skills, then complete each baseline assessment. Demonstrated abilities are saved separately from curriculum badges. The final screen proposes retaining the current starting point while the head coach reviews the evidence and foundational requirements.
7. Open **Attendance**, choose venue, date and session, mark students present, open relevant drills, add observations, and save. Reopen the same date/session or view the student's attendance history to see saved records. Unsubmitted session drafts survive navigation and refresh; saved Unmarked values clear previous marks, including an entire register.
8. Use the top-right role switcher to compare Management, Head Coach (Vikram Rao's assigned students), and Assistant Coach (the Spark session group at Indiranagar). Navigation, actions, search and student views adapt. Roles are simulated views, not security boundaries.
9. Open **Fitness Assessment** as Management. Intermediate students have separate sample result entry and chronological history across seven categories. No official standards, pass/fail scores, or rankings are invented.
10. Open **Reports**, apply filters, and export the filtered student summary as CSV. Coach operations show assignment and activity counts, never rankings.
11. Refresh the page to confirm local persistence. Settings offers a confirmed reset to restore the original fictional dataset.

## Structure

- `index.html`: application entry point and accessible modal/status containers.
- `styles.css`: shared design tokens, components, layout, and responsive styles.
- `js/data.js`: fictional seed records and category definitions.
- `js/curriculum.js`: PSB page 1 skills, training guidance, demo checklists and safe placeholder upgrades.
- `js/state.js`: browser persistence and activity log.
- `js/app.js`: shared rendering helpers, screen renderers, canonical routes, forms, and connected workflows.
- `js/domain.js`: assessment rules, cycle membership, current practice needs, session replacement and saved-state upgrades.
- `tests/`: domain regression tests and isolated browser workflow/refresh suites.
- `artifacts/QA.md`: findings, fixes, verification coverage and test instructions.

## Deliberate safeguards and limits

- Four beginner levels (Spark, Scout, Star, Champ), four badges each, sixteen total.
- Higher-level badges can be earned independently. Individual badges, baseline results, or tournament wins never automatically promote a student.
- The reference requires all four skills in the same level for a main badge. Completed collections are flagged for head-coach review; the prototype preserves the student's current level until that review.
- Every newly seeded badge has passing sample evidence after enrolment. Original first-version fixtures are reconciled during saved-state upgrade, retaining custom records and labelling imported prior learning. The dashboard counts assessment events within the reporting period; roster and badge totals represent current students and all-time awards.
- Video panels are clearly marked placeholders; no unrelated media is linked.
- Data stays in this browser under `visist-demo-v1`. Clearing browser site data removes changes. If storage is unavailable, the app reports that changes are session-only.
- The prototype intentionally has no authentication or authorization enforcement beyond role-aware demonstration controls.

## Verification

Run `npm test` for the nineteen rule and data-integrity regression tests; run `npm run check` for module syntax checks. The [QA report](artifacts/QA.md) documents the latest 103 passing browser assertions, additional edge-case checks and isolated browser-suite instructions. Browser suites reset their own demo records and must run in a separate browser session.

## PSB reference content

The user selected page 1, retaining Spark, Scout, Star and Champ. Skills are grouped by their visual columns; printed suffixes (for example Grip Scout within Spark) are preserved. Page 2’s alternate Rookie/Ace names, Hawk Eye activity and Balance skill are not used. Numeric targets are retained, including 10 forehand and 10 backhand air tosses, 10 alternating tosses, 10 opposite-hand catches, a 12-stroke Netking rally and a 20-stroke Consistency rally. The PDF does not specify five binary criteria or a 4/5 threshold; those remain explicitly labelled demo adaptations. Existing saved placeholder fields upgrade on refresh without replacing custom edits or historical assessment snapshots.

## Visual refresh

The sports academy theme adds player cards, a four-level skill journey, collectible level emblems and celebrations for newly earned regular badges. Counts and next targets derive from saved records. Refresh the running local preview and open a student profile or Curriculum to see the new design. Desktop and mobile previews and the latest checks are linked in [the QA report](artifacts/QA.md).

## Brand palette

The green refresh follows the live [VISIST website](https://www.visist.ai), inspected on 16 November 2026: primary emerald `#026B33`, deep green `#0D2D17`, neon lime `#A3E635` and electric lime `#CCFF00`. Emerald drives app actions and reporting; copper, silver, gold and blue remain level-specific badge colours.

## Demo meeting

The official uploaded VISIST.AI logo is used unchanged. See [the demo readiness report and meeting walkthrough](artifacts/DEMO-READINESS.md) for verified flows, startup instructions and prototype boundaries.

## Interactive analytics

Select a trend point to view its assessment period, or hover/focus for values. Outcome bars open records. Donut segments, level legends and venue rows filter the workspace with reset controls. Student progress bars open profiles. Fitness cards open chronological metric histories. Charts respect assignment scope and workspace filters. `tests/browser-chart-interactions.js` checks these interactions in an isolated browser session.
