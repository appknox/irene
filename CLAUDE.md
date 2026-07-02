<!-- BEGIN MATTERSEC GUIDELINES (managed by matt — do not edit by hand) -->
## Active engineering guidelines for this project

### Complexity & structure
- `[medium] cognitive-complexity` — Cognitive complexity per function <= 15
- `[medium] cyclomatic-complexity` — CCN per function <= 15 (test-coverage signal)
- `[medium] no-broad-exception-catch` — Don't swallow broad exceptions without re-raising
- `[medium] parameter-count-cap` — Function parameter count <= 5
- `[low] function-length-cap` — Function body <= 60 lines

### Cleanliness & documentation
- `[medium] docstring-on-new-public-api` — New public functions need a docstring
- `[medium] no-print-debug-in-source` — No print/console.log debugging in source
- `[medium] no-skipped-tests-without-reason` — Skipped tests must state a reason

### Test discipline
- `[medium] tests-accompany-src` — Source changes should come with test changes

Generated from guidelines bundle revision 1 · last updated 2026-06-26T22:19:29.502938+00:00
<!-- END MATTERSEC GUIDELINES -->
