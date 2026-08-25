---
name: write-component
description: Create or restructure an Ember Glimmer component in this project. Use when asked to add a new component, scaffold one, or fix the structure, imports, selectors or styling of an existing one. Enforces the project's file shape, class member order, data-test, translation and styling contracts.
---

# Write Component

See [ARCHITECTURE.md](../../../ARCHITECTURE.md) for how components fit the wider
app.

---

## Step 0 — Reuse before creating

Search first. Most of what a new component needs already exists.

```bash
ls app/components/ak-svg/                              # svgs
grep -rn "'<phrase>'" translations/en.json             # translation strings
ls app/components/ak-*/                                # design system parts
grep -rn "<Feature::" app/components --include="*.hbs" # similar feature parts
```

Reuse the existing svg, key or component. Add a near-duplicate only when the
existing one genuinely does not fit — and say why.

---

## Step 1 — Pick the namespace

| Kind              | Location                     | Rule                                                                                                                              |
| ----------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Design system** | `app/components/ak-*/`       | Generic and product-agnostic. No roles, no feature flags, no API calls, no translations of product copy. Add `index.stories.js`.  |
| **Feature**       | `app/components/<feature>/…` | Everything else. Namespaced by product area — `file-details`, `organization`, `sbom`, `storeknox`, `knox-iq`, `project-settings`. |

Putting a permission check or an API call inside an `ak-*` component is the most
common structural mistake. If it needs product knowledge, it is a feature
component that _uses_ `ak-*` parts.

---

## Step 2 — Generate the files

```bash
ember generate component <feature>/<name> -gc -ts
```

- `-gc` — Glimmer component class. The default is template-only, which is not
  what this project uses.
- `-ts` — TypeScript. Required because `.ember-cli` sets
  `isTypeScriptProject: false`.
- Nested structure (`index.hbs` + `index.ts` in a folder) is already the default
  here via `"componentStructure": "nested"` in `.ember-cli`. Do not pass
  `--pod` — this project does not use the pods layout.

Result:

```text
app/components/<feature>/<name>/
├── index.hbs
└── index.ts
```

Add by hand, when needed:

```text
├── index.scss          only if the component has styles
└── index.stories.js    ak-* only
```

Only create `index.scss` when you actually write styles. An empty or unused
stylesheet breaks `local-class` resolution at runtime.

**Always generate the `.ts`.** A template-only component is not in the Glint
registry, so every invocation of it raises a TypeScript error at the call site.
`-gc -ts` is not optional.

Delete the generated `tests/integration/components/**/*-test.ts` stub — it does
not follow this project's test conventions. Write the real test with the
`write-tests` skill.

---

## Step 3 — Class structure

```ts
// Block 1 — framework + third-party
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

// Block 2 — app-absolute (irene/*)
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type SomeService from 'irene/services/some-service';
import type SomeModel from 'irene/models/some-model';

// Block 3 — relative
import someValidator from './validator';

export interface SomeFeatureWidgetSignature {
  Element: HTMLElement;
  Args: { someModel: SomeModel };
  Blocks?: { default: [] };
}

export default class SomeFeatureWidgetComponent extends Component<SomeFeatureWidgetSignature> {
  // 1. Services — notifications aliased, listed last
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  // 2. Non-tracked fields
  changeset: SomeChangesetProps;

  // 3. @tracked state — grouped by concern
  @tracked isEditing = false;

  // 4. constructor
  constructor(owner: unknown, args: SomeFeatureWidgetSignature['Args']) {
    super(owner, args);
  }

  // 5. Getters
  get someDerivedValue() { ... }

  // 6. Plain helper methods — undecorated, not reachable from the template
  buildSomeUrl(kind: string) { ... }

  // 7. @action handlers
  @action
  handleClick() { ... }

  // 8. ember-concurrency tasks
  fetchDataTask = task(async () => { ... });

  // 9. Lifecycle teardown — last member
  willDestroy(): void {
    super.willDestroy();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Some::Feature::Widget': typeof SomeFeatureWidgetComponent;
  }
}
```

Within each import block, value imports come before `import type`. Local
`type`/`interface` declarations sit between the imports and the `Signature`;
module constants sit after it.

Undecorated methods are private helpers. They sit with the getters they support,
above the `@action` handlers — computation first, then the behaviour the
template can reach.

### Keep the class simple

The class holds the state the template renders and the handlers it calls.

- `@tracked` for state that changes, `get` for anything derived from it.
- One getter, one fact. No getter returning an object the template unpacks.
- No caching — `@tracked` already recomputes.
- Build arrays in JS only for real data: select options, API rows. Fixed markup
  belongs in the template.
- No mixins or base classes.

```ts
// ❌ two identical getters
get isFrequencyDisabled() { return this.isEditDisabled || !this.enabled; }
get isEmailDisabled() { return this.isEditDisabled || !this.enabled; }

// ✅
get isFieldDisabled() { return this.isEditDisabled || !this.enabled; }
```

```ts
// ❌ one getter, two facts
get saveButton() { return { label: this.intl.t('save'), disabled: this.isSaving }; }

// ✅ the label is template text
get isSaveDisabled() { return this.isSaving; }
```

A long class is a component doing two jobs. Split it before you abstract it.

### No `_` prefix on private members

Applies to fields, getters, methods and `@action` handlers alike. Everything on
the class is private unless the template or a test reads it, and this codebase
marks none of it with an underscore.

```ts
// ❌  private _cachedRows = [];        ❌  _buildUrl() {}
// ✅  cachedRows = [];                 ✅  buildUrl() {}
```

### One name, one member

Two class members must not share a name, and two names must not hold the same
value. This includes a getter that shadows a field, and a local `const` inside a
getter reusing a service or arg name. Nothing warns — the second definition wins
silently.

### Reuse `ENUMS`, don't redeclare

Status, severity, risk and platform values live in `app/enums.ts` and the
matching model. Import them.

```ts
// ❌ local copy that drifts from the backend
const RISK = { NONE: 0, LOW: 1, MEDIUM: 2 };

// ✅
import ENUMS from 'irene/enums';
ENUMS.RISK.LOW;
```

A genuinely new set of backend values goes in `app/enums.ts` or, if it belongs
to one model, as an exported `enum` beside that model.

### Don't refetch what the route already loaded

If the route resolved the record, take it as an arg. A second `store.findRecord`
for the same id fires another request and gives you a second object identity.

```ts
// ❌ get project() { return this.store.findRecord('project', this.args.projectId); }
// ✅ Args: { project: ProjectModel }
```

---

## Step 4 — Template

**Every element carrying text, state or interaction needs a `data-test-*`
attribute.** Tests select on these and nothing else — never a class or id,
because `local-class` names are hashed at build time.

Naming: `data-test-<featureNamespace>-<componentPath>-<element>`, camelCase.

```hbs
data-test-fileDetails-dynamicScan-startBtn
data-test-organization-editAnalysis-toggle
```

Rules:

- All user-facing text goes through `{{t 'key'}}` — never a literal. Attributes
  too: `aria-label={{t 'key'}}`, `placeholder={{t 'key'}}`.
- Pass state to `AkButton` and friends as `@disabled=`, not `disabled=`.
  `AkButton` applies `...attributes` before its own binding and will silently
  overwrite a plain attribute.
- Use `local-class` for styling, `class` only for utility classes.
- Reach for an existing utility before writing CSS. `AkStack` covers layout
  through its own args (`@width='full'`, `@direction`, `@spacing`,
  `@alignItems`), and the utility classes cover the rest (`w-full`, `h-full`,
  and the others already in `app/styles/`). Do not add a local class or an
  inline `style` for something a utility already does. Write a local class only
  where none applies.
- Keep logic out of the template. A condition with more than one operator, or a
  nested `{{if}}` inside `{{if}}`, becomes a named getter on the class.

```hbs
{{! ❌ }}
{{#if (and this.isOwner (not @request.isPending) (eq @request.status 2))}}

{{! ✅ }}
{{#if this.canApproveRequest}}
```

### Comments

Write a comment only where the code cannot say it — a backend quirk, a
non-obvious ordering, a workaround with its reason. Do not narrate structure
(`{{! Header section }}`, `// Services`, `// Render the list`) and do not leave
multi-line explanatory blocks above ordinary members. The same applies to `.ts`,
`.hbs` and `.scss`.

Keep each one to a line where you can. State the specific thing — the endpoint,
the field, the status — not a general observation.

```ts
// ❌ This is needed because of how the backend handles the response payload
// ✅ Backend returns 200 with an empty body on delete
```

### Template past 250 lines

Move the largest block out into its own child component in the same namespace.
Usually one extraction is enough — you are not breaking the whole template up.

```text
scan-schedule/
├── index.hbs          keeps the rest
└── frequency-form/    the block that was too big
```

Take the state that block needs with it. The child gets its own `data-test-*`
prefix and test suite.

### Check every sub-component's signature before using it

**Read the `Args` and the value unions of each `ak-*` component you compose.**
Do not guess an argument name or a string value from memory or from a similar
component — the unions are specific and a wrong value fails silently, rendering
nothing rather than erroring.

```bash
sed -n '/Args: {/,/^  };/p' app/components/ak-stack/index.ts
grep -nE "^type |^export type " -A10 app/components/ak-stack/index.ts
```

Common traps:

| Component              | Trap                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `AkStack`              | `@alignItems` / `@justifyContent` take CSS-style kebab values — `'flex-start'`, not `'flexStart'`                          |
| `AkTypography`         | `@color` is a token name (`'textSecondary'`), not a CSS colour. `@variant` is one of `h1`–`h6`, `subtitle1/2`, `body1/2/3` |
| `AkButton`, `AkToggle` | State goes through `@disabled`, never a plain attribute                                                                    |
| Any                    | Passing an unlisted value renders the default silently — no error, no warning                                              |

`tsc` catches wrong argument _names_ through Glint, but not always wrong string
_values_ in a template. Read the union.

---

## Step 5 — Icons and SVGs

### Iconify icons — `AkIcon`

Icon names come from the sets in `app/utils/icons.ts`. Add the name to the set it
belongs to, then regenerate:

```bash
grep -n "material-symbols:check" app/utils/icons.ts   # already there?
# add to the matching *IconsSet, then:
npm run build:icons                                    # writes public/ak-icons.json
```

If the icon belongs to a **set that does not exist yet**, its package must be
installed first — generation silently produces nothing without it:

```bash
npm i -D @iconify-json/<group>
```

Then add a new `<Group>IconsSet` export in `app/utils/icons.ts` and rerun the
build. Commit the regenerated `public/ak-icons.json` with the change.

### Custom SVGs — `ak-svg`

**Every svg in the app lives in `app/components/ak-svg/`.** Never paste raw
`<svg>` markup into a component template and never add a second copy of an
existing svg — check `ls app/components/ak-svg/` first.

To add one:

1. Create `app/components/ak-svg/<kebab-name>.hbs` holding only the `<svg>`
   element, with `...attributes` on it so callers can size and style it.
2. Register it in `types/ak-svg.d.ts` — **both** enums, each in alphabetical
   position:
   - `AkSvgComponentInvocationByNames` → `PascalCase` member
   - `AkSvgComponentInvocationByPaths` → `'kebab-name'` member
3. Invoke it as `<AkSvg::KebabName />`.

Missing either enum entry means the invocation is not in the Glint registry and
`tsc` fails at the call site.

---

## Step 6 — Styles

Three layers, and the middle one is not optional:

```text
_theme.scss                  raw values
_component-variables.scss    per-component bridge variables
index.scss                   local-class, bridge variables only
```

A component's SCSS references variables prefixed with its own folder path, and
never reaches past the bridge to a raw theme value. Full procedure in the
`component-scss-refactor` skill.

---

## Step 7 — Invariants

- `ak-*` components have no product knowledge.
- Feature flags come from `organization.selected.features`, never `ENV`.
- Roles come from `me.org` (`is_owner`, `is_admin`, `is_member`).
- Endpoint fragments come from `ENV.endpoints`, never a string literal.
- Reading `this.me` triggers a network request — guard it behind cheaper
  conditions so the component does not fetch on every render.
- **Do not change `ak-*` components** to make a feature work. Compose them. Edit
  one only when the feature genuinely needs a new capability there, and say why.
- **There is no dark theme.** Do not add `prefers-color-scheme` blocks, dark
  colour variants or theme-switching logic to anything.

---

## Step 8 — Translations

Every new string needs a key in **both** `translations/en.json` and
`translations/ja.json`. The two files must stay at identical key structure.
Use the `add-translations` skill.

---

## Step 9 — Verify

```bash
npx eslint app/components/<path>/index.ts --fix
npx ember-template-lint app/components/<path>/index.hbs
npx tsc --noEmit -p tsconfig.json
```

Then write tests with the `write-tests` skill. It depends on the `data-test-*`
attributes from Step 4 already existing.
