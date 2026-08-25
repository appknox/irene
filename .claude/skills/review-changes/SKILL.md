---
name: review-changes
description: Review the current branch's changes against this project's standards — architecture invariants, component structure, styling, translations and tests. Use when asked to review a diff, a branch or a pull request before it goes out, or to check whether a change follows the project conventions.
---

# Review Changes

Check a diff against the rules the other skills enforce. Report findings; do not
fix anything unless asked.

**Read the skill before reviewing the files it governs.** Every rule in the
table below is enforced here — a change that touches components is checked
against the whole of `write-component`, a stylesheet against the whole of
`component-scss-refactor`, and so on. The steps that follow summarise them; the
skill file is the authority, so open it rather than reviewing from memory.

| Changed                                                                                                                                           | Rules in                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `app/components/**`                                                                                                                               | `write-component`                                                                                              |
| `**/*.scss`, `_component-variables.scss`, `_theme.scss`                                                                                           | `component-scss-refactor`                                                                                      |
| `translations/*.json`                                                                                                                             | `add-translations`                                                                                             |
| `tests/**`                                                                                                                                        | `write-tests`                                                                                                  |
| `app/utils/icons.ts`, `app/components/ak-svg/**`, `types/ak-svg.d.ts`                                                                             | `write-component` §5                                                                                           |
| `app/routes/**`, `app/controllers/**`, `app/adapters/**`, `app/serializers/**`, `app/models/**`, `app/services/**`, `app/helpers/**`, `mirage/**` | No skill covers these. Match the existing files in the same folder and flag anything inconsistent — see Step 8 |
| Anything                                                                                                                                          | [ARCHITECTURE.md](../../../ARCHITECTURE.md) §5 invariants, §6 sharp edges                                      |

---

## Step 1 — Scope the diff

```bash
git diff develop...HEAD --name-only
git status --short
```

List the changed files, grouped by the table above, and work through them **one
file at a time**. Read each in full — a diff hunk hides the surrounding context
most of these rules depend on — but review only what the branch changed in it.

### The per-file loop — do not deviate from this

For each file:

1. Review it against the skill that governs it, plus Steps 2, 7 and 8.
2. Report the findings for that file alone.
3. Fix them.
4. **Stop and ask the user to review the fix. Wait for their reply.**
5. Move to the next file only after they respond.

When a fix cannot stand alone — a component and its template, a template and its
translation keys, a component and its test — fix the whole connected set
together, present it as one change, and ask for review on the set.

**The user's review is mandatory at every step.** Do not batch several files
into one report, do not fix ahead while waiting, and do not continue on the
assumption that a fix is obviously correct.

---

## Step 2 — Architecture

Check against [ARCHITECTURE.md](../../../ARCHITECTURE.md):

- **§5 invariants.** `ak-*` free of product knowledge; features from
  `organization.selected.features` not `ENV`; roles from `me.org`; endpoints
  from `ENV.endpoints`; component SCSS never reaching past the bridge.
- **§6 sharp edges.** Any new code touching `this.me`, a serializer
  `primaryKey`, `parseError`, `@disabled`, or `IreneAjaxService` verbs.
- **§2.1 layer direction.** Components must not reach adapters. Adapters must
  not reach services beyond URL construction.
- **Did the change make the doc wrong?** If it altered a layer boundary, a
  contract, an invariant or a sharp edge, `ARCHITECTURE.md` should be updated in
  the same PR.

---

## Step 3 — Components

Per `write-component`:

- File shape and namespace — `ak-*` only for product-agnostic parts
- Import blocks, class member order, Glint registry present and last
- `Element` declared, `HTMLElement` unless a plain tag is the root
- `data-test-*` on every element with text, state or interaction
- All user-facing text through `{{t}}`, including `aria-label` and `placeholder`
- `@disabled=` not `disabled=`
- Sub-component args and string values match the real signature
- Class stays simple — no duplicate getters, no getter returning several facts,
  no manual caching
- No `_` prefix on private members; no two members sharing a name or a value
- Status/risk values come from `ENUMS` or the model enum, not a local copy
- No `store.findRecord` for a record the route already resolved
- Complex template conditions moved to a named getter
- Width via `@width='full'` or `w-full`, not a new class or inline `style`
- Template under ~250 lines
- **No dark-mode handling added** — the product has no dark theme
- **`ak-*` components unchanged**, unless the feature genuinely needs a new
  capability there and the change says why

### Icons and SVGs

- New `AkIcon` names exist in the right set in `app/utils/icons.ts`
- `public/ak-icons.json` was regenerated and committed — a name added to the set
  without rerunning `npm run build:icons` renders nothing:

  ```bash
  git diff develop...HEAD --name-only | grep -E "icons.ts|ak-icons.json"
  node -e "const i=require('./public/ak-icons.json');console.log(JSON.stringify(i).includes('<icon-name>'))"
  ```

- **A new icon group needs its `@iconify-json/*` package installed.** Without it
  generation silently produces nothing. Flag it if missing:

  ```bash
  grep '"@iconify-json/<group>"' package.json
  ```

- Raw `<svg>` markup in a feature template — every svg belongs in
  `app/components/ak-svg/`
- A new `ak-svg` is registered in **both** enums in `types/ak-svg.d.ts`, each in
  alphabetical position
- The svg or icon does not duplicate one that already exists

---

## Step 4 — Styles

Per `component-scss-refactor`:

- Component SCSS uses bridge variables prefixed with its own folder path
- No raw theme variable or hardcoded colour in a component stylesheet
- New bridge variables added to `_component-variables.scss` in the right section
- New raw values added to `_theme.scss`, not inlined
- No `var(--x, fallback)` — the fallback hides a missing bridge variable
- `em` used for padding, margin and gap; `px` kept for borders and fixed
  dimensions
- `:global()` only for third-party addon classes (`.ember-power-select-*`) or
  `ak-*` internals (`.ak-icon`) — never for markup the component owns
- No descendant chains into another component's markup (`.drawer > div > span`)
- `!important` only where it outranks an addon or `ak-*` rule
- No duplicate variable names, and no two names holding the same value, within a
  component's block in `_component-variables.scss`
- No `prefers-color-scheme` or dark variants

---

## Step 5 — Translations

Per `add-translations`:

- Every new string has a key; no literals in templates or `intl.t` calls
- Key exists in **both** `en.json` and `ja.json`, same position
- Root keys inserted alphabetically, never appended
- No duplicate of an existing key
- A feature's strings nested under one parent key, not a run of flat root keys
  prefixed with the feature name

```bash
node -e "const en=require('./translations/en.json'),ja=require('./translations/ja.json');
const p=(o,x='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v?p(v,x+k+'.'):[x+k]);
const a=new Set(p(en)),b=new Set(p(ja));
console.log('only-en',[...a].filter(k=>!b.has(k)),'only-ja',[...b].filter(k=>!a.has(k)))"
```

---

## Step 6 — Tests

Per `write-tests`:

- Every changed component, model, adapter, serializer and helper has tests
- The scenario matrix is covered: both branches of each conditional, each
  getter output, success **and** failure for each action or task
- Fixtures come from Mirage factories; non-deterministic defaults pinned
- New factory properties use `faker`, and are functions where each record needs
  its own value — a bare `faker.x()` is evaluated once at import
- Exact notification messages, regex icons, no `.exists()` before a chain
- Collections: count asserted, plus every item or one item exhaustively
- Interaction tests assert pre-state and post-state
- `setupMirage(hooks)` present, and every record used has a Mirage model and
  factory — no hand-built object standing in for a missing one
- No assertions on padding, colour, `border-radius`, `font-size` or computed
  style. A file whose assertions are only these should be rewritten or deleted
- Records every test needs are created in `beforeEach`, not repeated per test

---

## Step 7 — Dead code and comments

- **Unused components, files, exports, getters, actions and translation keys.**
  Anything the branch adds must be reached by something, and anything it stops
  using must be deleted rather than left behind.

  ```bash
  grep -rn "MyNewComponent\|<Feature::MyNew" app tests --include="*.hbs" --include="*.ts"
  grep -rn "'newTranslationKey'" app | head
  ```

- **Comments across every changed file** — `.ts`, `.hbs`, `.scss`, tests.
  A comment earns its place by explaining something the code cannot: a backend
  quirk, a workaround and its reason. Flag comments that narrate structure
  (`// Services`, `{{! Header section }}`, `// Render the list`) and multi-line
  explanatory blocks above ordinary members.
- Commented-out code, leftover `console.log`, `TODO` without a ticket.

---

## Step 8 — Consistency with the codebase

The skills do not cover everything, and nothing covers routes, controllers,
adapters, serializers, models, services or helpers. For those, the standard is
the existing code: read two or three neighbouring files in the same folder,
work out the pattern they share, and flag where the change departs from it.
New code should also look like the code around it. Check these, and when the change does something the codebase has an
established way of doing, say so.

| Pattern          | Convention                                                                      |
| ---------------- | ------------------------------------------------------------------------------- |
| Task naming      | `x = task(...)`, no `Task` suffix — 460 vs 22                                   |
| Action naming    | `handleX` for event handlers — 418 uses, then `openX` / `closeX` / `toggleX`    |
| Errors in a task | `catch { this.notify.error(parseError(error, this.intl.t('pleaseTryAgain'))) }` |
| Loading state    | `task.isRunning`, read directly in the template                                 |
| Dates            | `dayjs(...)` directly — 115 uses; the `datetime` service is not the norm        |
| Paginated lists  | `AkPaginationProvider` — 55 templates                                           |
| Notifications    | `@service('notifications') declare notify`                                      |

Before flagging something as inconsistent, confirm the convention actually
holds:

```bash
grep -rhoE "<pattern>" app/components --include="*.ts" | wc -l
```

A single precedent is not a convention. If the codebase is genuinely split, say
it is split rather than picking a side.

---

## Step 9 — Verify

```bash
npx eslint <changed .ts/.js> --fix
npx ember-template-lint <changed .hbs>
npx tsc --noEmit -p tsconfig.json
jq -e . translations/en.json > /dev/null && jq -e . translations/ja.json > /dev/null
```

Ask the user to run the test suite. Do not run it.

---

## Step 10 — Report

Group findings by severity, most severe first. For each: the file and line, what
is wrong, and the rule it breaks.

- **Breaks** — an invariant violated, a sharp edge hit, a missing test for new
  behaviour, a translation in one file only
- **Deviates** — a convention not followed where the codebase is consistent
- **Consider** — a simplification, with the reason

State what you checked and found clean. If a rule could not be checked, say so
rather than implying it passed.

Report per file, not per branch. After each file's fixes, hand it back to the
user and wait.
