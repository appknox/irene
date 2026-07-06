---
name: write-integration-tests
description: Write Ember integration tests for components in this project. Use when asked to write, add, or complete integration tests for a component. Follows the project's established patterns for Mirage, store fixtures, selectors, assertions, and test structure.
---

# Write Integration Tests

Write QUnit integration tests for Ember Octane/Glimmer components using `setupRenderingTest`, `setupMirage`, and `setupIntl`.

---

## Step 1 — Read the component and audit every scenario

Before writing any test, read:

- `index.hbs` — every `data-test-*` attribute, conditional branches (`{{#if}}` / `{{#unless}}`), child components
- `index.ts` — tracked state, tasks, actions, services used, args, computed getters

Then build a scenario inventory by cross-referencing **all** of these:

| Source | What to capture |
|--------|----------------|
| `{{#if condition}}` blocks in `.hbs` | Both the truthy and falsy render paths |
| `{{#each}}` loops | Empty-collection state + populated state |
| `@tracked` properties | Every distinct value that changes rendered output |
| Computed getters (e.g. `renamedRoles`, `showEmptyContainer`) | Each branch of the getter — especially cases where the getter returns a subset or empty list |
| Action handlers | The happy path, error path, and any in-progress/loading state |
| Nullish-coalescing / optional-chaining in actions | Both sides: when the left value exists vs. when it auto-creates/falls back |
| `rollbackAttributes()` calls | Cancel flows for **persisted** (id-bearing) records, not just new ones |
| Adapter calls | Each endpoint called — including update/rename paths that differ from create paths |

**Only declare the test suite complete once every cell in this inventory has a corresponding test.**

---

## Step 2 — File structure

Every test file follows this exact top-to-bottom order:

```
imports
stub classes (NotificationsStub, RouterStub)
// ─── Selectors ───
const selectors = { ... }
// ─── Template ───
const TEMPLATE = hbs`...`
// ─── Helpers ───           ← only present when shared model-setup helpers are needed
function pushMyModel(...) { ... }
// ─── Test suite ───
module('Integration | Component | ...', function (hooks) { ... })
```

The `// ─── Helpers` section is **optional** — add it only when multiple tests share non-trivial model-setup boilerplate (see Step 6a).

Inside the module, group tests under section dividers:

```js
// ─── Section title ─────────────────────────────────────────────────────────────
```

---

## Step 3 — Selectors

Define all selectors in a `const selectors = {}` object **outside** the module:

- Use the full `data-test-*` attribute as a CSS selector string
- Follow the `data-test-projectSettings-dastAutomation-<componentPath>-<element>` naming convention
- For dynamic selectors (e.g. keyed by index or label), use a function: `rowItem: (label) => \`[data-test-..="${label}"]\``
- For scoped sub-selectors (e.g. toggle inside a row), scope in the assertion: `assert.dom(selector, rowElement)`

---

## Step 4 — Service stubs

```js
class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  error(msg) {
    this.errorMsg = msg;
  }
  success(msg) {
    this.successMsg = msg;
  }
}

class RouterStub extends Service {
  transitionToArgs = null;
  replaceWithArgs = null;
  transitionTo(...args) {
    this.transitionToArgs = args;
  }
  replaceWith(...args) {
    this.replaceWithArgs = args;
  }
}
```

Register in `beforeEach`:

```js
this.owner.register('service:notifications', NotificationsStub);
// Router MUST be unregistered before re-registering:
this.owner.unregister('service:router');
this.owner.register('service:router', RouterStub);
```

---

## Step 5 — Store fixture pattern

**Never spread** `toJSON()`. Pass it directly:

```js
// ✅ Correct
const record = this.server.create('model', { attr: value });
const normalized = store.normalize('model', record.toJSON());
const model = store.push(normalized);

// ❌ Wrong
store.normalize('model', { ...record.toJSON() });
```

Use `this.setProperties({ ... })` to set multiple properties at once in `beforeEach`.

---

## Step 6a — Helper extraction for shared model setup

When three or more tests repeat the same 3+ line `toJSON → normalize → push` boilerplate for a model that also embeds optional nested records (roles, steps, parameters, etc.), extract a named helper **outside the module** in the `// ─── Helpers` section.

### Shape

```js
/**
 * One-line docstring: what it normalizes and what options it accepts.
 */
function pushMyModel(store, record, { nested = [] } = {}) {
  const json = record.toJSON();

  if (nested.length) {
    json.nestedKey = nested.map((n) => n.toJSON());
  }

  return store.push(store.normalize('my-model', json));
}
```

### Rules

- Use a default-parameter destructure (`{ nested = [] } = {}`) so callers can omit options entirely.
- Guard with `if (nested.length)` before setting the array — the factory default may already provide `[]`, so only override when records are actually passed.
- Return the pushed record so callers can assign it directly: `const model = pushMyModel(this.store, record)`.
- Keep the helper **pure** — no `this`, no side effects beyond the store push.

### Usage

```js
// Simple (no nested records)
const model = pushMyModel(this.store, this.server.create('my-model'));

// With nested records — Prettier requires multi-line shorthand
const model = pushMyModel(this.store, this.server.create('my-model'), {
  nested,
});
```

---

## Step 6 — Mirage routes

Use the `v2` (or appropriate version) namespace relative path. Mirage prepends `api` automatically:

```js
this.server.get('/v2/projects/:projectId/scenarios', ...);
this.server.post('/v2/projects/:projectId/scenarios', ...);
this.server.put('/v2/projects/:projectId/scenarios/:id', ...);
this.server.del('/v2/projects/:projectId/scenarios/:id', ...);
```

For list endpoints using DRF pagination, return:

```js
{ count: results.length, next: null, previous: null, results: [...] }
```

For reload-after-mutate tests, use schema-backed GET handlers so the reload reflects changes:

```js
this.server.get('/v2/projects/:projectId/scenarios', (schema) => {
  const results = schema.scenarios.all().models.map((s) => s.toJSON());

  return { count: results.length, next: null, previous: null, results };
});
```

For loading state tests, use `{ timing: N }` and `waitFor` / `waitUntil`:

```js
this.server.get('/v2/...', () => ({ ... }), { timing: 150 });

render(TEMPLATE); // no await

await waitFor(selectors.loader, { timeout: 200 });
assert.dom(selectors.loader).exists();

await waitUntil(() => !find(selectors.loader), { timeout: 500 });
assert.dom(selectors.loader).doesNotExist();
```

---

## Step 7 — Assertion rules

### No `.exists()` before chained assertions

```js
// ✅ Correct
assert.dom(selectors.name).containsText('foo');

// ❌ Wrong
assert.dom(selectors.name).exists().containsText('foo');
```

### Always test the specific rendered element, not just the container

Every meaningful piece of text or UI state must have its own `data-test-*` attribute in the component template. Do not rely on generic component selectors like `[data-test-ak-typography]` as a proxy.

If a `data-test-*` attribute is missing, add it to the template before writing the test:

```hbs
{{! ✅ Give the element its own attribute }}
<AkTypography data-test-myComponent-scenarioName>{{@scenario.name}}</AkTypography>

{{! ❌ Don't rely on the generic component selector }}
<AkTypography>{{@scenario.name}}</AkTypography>
```

```js
// ✅ Then test with the specific selector
assert.dom(selectors.scenarioName).containsText(scenario.name);
```

### Scoped DOM assertions for table rows

Use `assert.dom(selector, rowElement)` to scope within a specific row:

```js
const rows = findAll(selectors.tableRow);
scenarios.forEach((scenario, i) => {
  assert.dom(rows[i]).containsText(scenario.name);
  assert.dom(selectors.toggleInput, rows[i]).isChecked();
});
```

### Notification assertions — always assert the exact message

Never use `assert.ok(notify.errorMsg)` or `assert.ok(notify.successMsg)`. These only confirm a truthy value was set, not the content. Always use `assert.strictEqual`:

```js
// ✅ Correct
assert.strictEqual(
  notify.successMsg,
  t('dastAutomation.saveSuccess'),
  'shows success notification'
);

assert.strictEqual(
  notify.errorMsg,
  'The backend responded with an error',
  'shows error notification'
);

// ❌ Wrong
assert.ok(notify.errorMsg);
assert.ok(notify.successMsg, 'shows success');
```

**DRF adapter 500 errors:** The Ember Django Adapter's `normalizeErrorResponse` (inherited from RestAdapter) sets every error object's `title` to `'The backend responded with an error'` regardless of HTTP status. `parseError` reads `error.title`, so the notification message for a bare `new Response(500)` is always `'The backend responded with an error'` — not `'Internal Server Error'` (that string is only used as `AdapterError.message`, not the notification content).

---

### HTML translations

Use `compareInnerHTMLWithIntlTranslation` from `irene/tests/test-utils` when translations contain HTML (`htmlSafe=true`):

```js
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

compareInnerHTMLWithIntlTranslation(assert, {
  selector: selectors.notesList,
  message: t('translationKey'),
  doIncludesCheck: true,
});
```

### Icon assertions — always use RegExp, not exact strings

- Use a **regex literal** when the icon name is a known constant:
  ```js
  assert.dom(selectors.errorIconSymbol).hasAttribute('icon', /error/);
  ```
- Use **`new RegExp(variable)`** when the icon name comes from a variable:
  ```js
  assert.dom(`${selectors.popoverItem(config.label)} [data-test-ak-icon]`)
    .hasAttribute('icon', new RegExp(config.icon));
  ```
- Never use a plain string:
  ```js
  // ❌ Wrong
  assert.dom('[data-test-ak-icon]').hasAttribute('icon', 'error');
  ```

---

## Step 8 — Tooltip testing

`AkTooltip` uses `AkPopover` with `EmberWormhole` — the tooltip content is teleported out of the parent. Trigger `mouseenter` with `find()` first, then assert `[data-test-ak-tooltip-content]` without scoping to the parent:

```js
await triggerEvent(find(selectors.tooltipWrapper), 'mouseenter');
assert.dom('[data-test-ak-tooltip-content]').containsText(t('translationKey'));
```

For disabled tooltips (`@disabled={{true}}`), the `AkPopover` is not rendered — use `.doesNotExist()` on `[data-test-ak-tooltip-content]`.

---

## Step 9 — AkPopover / popover open pattern

This pattern only applies when testing a **standalone popover component** — one that receives `@anchorRef` as an external arg (e.g. `AddStepsPopover`).

For components that manage their own open state internally (e.g. `EditScenario` tracking `showModal`), just click the trigger — no `anchorRef` setup needed.

For standalone popovers: `AkPopover` only mounts its content when `@anchorRef` is set. Render a trigger button alongside the component and set `anchorRef` from `event.currentTarget`:

```hbs
<button type='button' data-test-trigger {{on 'click' this.handleOpen}}>
  Open
</button>
<MyPopoverComponent @anchorRef={{this.anchorRef}} ... />
```

```js
this.setProperties({
  anchorRef: null,
  handleOpen: (event) => this.set('anchorRef', event.currentTarget),
  handleClose: () => this.set('anchorRef', null),
});
```

---

## Step 10 — Cancel / close test pattern

For cancel and close actions, always assert **before and after**:

1. Before opening: assert the initial list/state (count + key properties of each item)
2. Open and interact (fill fields, toggle state)
3. Assert the in-modal state (field values, toggle checked, button states)
4. Cancel/close
5. Assert modal is gone AND the original list/state is unchanged

```js
const rowsBefore = findAll(selectors.tableRow);
assert.strictEqual(rowsBefore.length, 1);
assert.dom(rowsBefore[0]).containsText(existing.name);
assert.dom(selectors.rowToggle, rowsBefore[0]).isChecked();

// ... open modal, fill, cancel ...

const rowsAfter = findAll(selectors.tableRow);
assert.strictEqual(rowsAfter.length, 1);
assert.dom(rowsAfter[0]).containsText(existing.name);
assert.dom(selectors.rowToggle, rowsAfter[0]).isChecked();
```

---

## Step 11 — What NOT to test

- **Skeleton loader components** — skip standalone tests; cover loading state on the parent component instead.
- **AkPopover/tooltip internals** — only test the component's specific `data-test-*` attributes and the resulting text/state.
- **Interaction flows already covered by child component tests** — when a child component is already tested in isolation, the parent test only needs to verify it renders (exists) in the right state, not re-test its full interaction flow.

---

## Step 12 — AkSelect interaction pattern

Always use the helpers from `irene/tests/helpers/mirage-utils`:

```js
import {
  assertAkSelectTriggerExists,
  chooseAkSelectOption,
  getAllAkSelectOptions,
  assertAkSelectOptionSelected,
} from 'irene/tests/helpers/mirage-utils';
```

**Assert a trigger is rendered:**
```js
assertAkSelectTriggerExists(assert, selectors.mySelect);
```

**Read all options (opens dropdown):**
```js
const options = await getAllAkSelectOptions(selectors.mySelect);

assert.strictEqual(options.length, expectedOptions.length);
expectedOptions.forEach((opt, i) => {
  assert.dom(options[i]).containsText(t(opt.label));
});
```

**Select an option by label text and assert side effects:**
```js
await chooseAkSelectOption({
  selectTriggerClass: selectors.mySelect,
  labelToSelect: t('some.labelKey'),
});

assert.strictEqual(this.model.field, 'expectedValue');
assert.deepEqual(this.callbackCalledWith, [this.model, 'field']);
```

**Select by index instead of label:**
```js
await chooseAkSelectOption({
  selectTriggerClass: selectors.mySelect,
  optionIndex: 2,
});
```

Never import `AkSelectStyles` directly or build trigger selectors manually. Do not use `findAll('.ember-power-select-option')` directly — use `getAllAkSelectOptions` instead.

Always test **both** the options list (count + label text) AND the side effect of selecting (model update or callback call).

---

## Step 13 — test.each for repeating cases

Use `test.each` when multiple tests share the same assertion logic with different inputs:

```js
test.each(
  'plain descriptive title covering the whole group',
  [
    [case1_arg1, case1_arg2],
    [case2_arg1, case2_arg2],
  ],
  async function (assert, [arg1, arg2]) {
    // test body using arg1 and arg2
  }
);
```

**Title rules:**
- Use a plain descriptive string — no `${0}`, `${1}`, or index placeholders in titles; they do not work in this project's QUnit setup.
- The title describes what the whole group tests, not individual cases (e.g. `'renders value cell and unit select visibility per action type'`, not `'renders ${0} action'`).

Good candidates for `test.each`:
- Value cell rendering per action type (same existence checks, different action)
- Validation error counts (identifier-only / value-only / both)
- Input interaction → callback called with correct field key
- Read-only state per field type

For dynamic method calls based on a boolean param:
```js
assert.dom(selector)[condition ? 'exists' : 'doesNotExist']();
```

---

## Step 14 — Input interaction pattern

For `fillIn` on an `AkTextField`, target the element directly — `...attributes` spreads onto the inner `<input>`:

```js
import { fillIn, find } from '@ember/test-helpers';

await fillIn(find(selectors.myTextField), 'new value');

assert.deepEqual(this.clearStepErrorCalledWith, [this.model, 'fieldName']);
```

Capture callbacks with a property on `this`:

```js
this.setProperties({
  clearStepErrorCalledWith: null,
  clearStepError: (...args) => this.set('clearStepErrorCalledWith', args),
});
```

Then assert `this.clearStepErrorCalledWith` equals the expected `[model, fieldKey]` pair.

---

## Step 15 — Pre/post state assertion pattern

For every interaction test, assert the **before state**, perform the interaction, then assert the **after state**. Never stop at existence checks — verify the actual content, values, and side effects.

### Structure

```js
test('description of what the interaction does', async function (assert) {
  await render(TEMPLATE);

  // ── Pre-state ──────────────────────────────────────────
  // Assert what exists, what its content is, and what callbacks have NOT fired yet.
  assert.dom(selectors.roleName).containsText('Test Role');
  assert.dom(selectors.roleNameInput).doesNotExist();
  assert.strictEqual(this.callbackCalledWith, null);

  // Perform interaction
  await click(selectors.editRoleNameBtn);
  await fillIn(find(selectors.roleNameInput), 'New Name');
  await click(selectors.confirmRoleNameBtn);

  // ── Post-state ─────────────────────────────────────────
  // Assert what changed AND verify values, not just existence.
  assert.dom(selectors.roleName).containsText('New Name');
  assert.dom(selectors.roleNameInput).doesNotExist();
  assert.strictEqual(this.callbackCalledWith, this.model);
});
```

### Rules

- **Content over existence** — prefer `.containsText()`, `.hasValue()`, `.strictEqual()` over `.exists()` / `.doesNotExist()` alone. The latter is only acceptable when an element should genuinely not appear at all (no content to check).
- **Check both sides of a toggle** — if an element appears in the post-state, also assert it was absent before. If it disappears, assert it was present with specific content before.
- **Callback argument verification** — for action callbacks, always assert the exact argument passed (`assert.strictEqual(this.calledWith, this.model)`), not just that the function fired.
- **Model mutation verification** — when an interaction mutates a model record directly (e.g. `step.action = …`), assert the new attribute value on the model after the interaction.
- **Negative pre-state for callbacks** — before an interaction, assert `this.callbackCalledWith === null` (or whichever sentinel value was set) to confirm the callback has not fired prematurely.

### Example: testing a delete flow

```js
test('confirming role deletion calls onDeleteRole with the role and closes the confirm box', async function (assert) {
  await render(TEMPLATE);

  await click(selectors.deleteRoleBtn);

  // Pre: confirm box open, callback not yet called
  assert.dom(selectors.confirmBoxConfirmBtn).containsText(t('delete'));
  assert.strictEqual(this.onDeleteRoleCalledWith, null);

  await click(selectors.confirmBoxConfirmBtn);

  // Post: confirm box gone, callback received the right argument
  assert.dom(selectors.confirmBoxConfirmBtn).doesNotExist();
  assert.strictEqual(this.onDeleteRoleCalledWith, userRole);
});
```

---

## Step 16 — Checklist before writing

**Scenario coverage (Step 1)**
- [ ] Every `{{#if}}` / `{{#unless}}` branch has a test for the truthy and falsy path
- [ ] Every computed getter's distinct output cases are covered (empty subset, full subset, etc.)
- [ ] Auto-create side effects (`?? createX()`) tested with the left-side-absent case
- [ ] `rollbackAttributes()` cancel flows tested for persisted (id-bearing) records, not just new ones
- [ ] Every distinct adapter endpoint called by the component has a success test AND an error test
- [ ] No `assert.ok(notify.errorMsg)` or `assert.ok(notify.successMsg)` — always `assert.strictEqual` with exact message

**File structure**
- [ ] All `data-test-*` attributes identified from the template
- [ ] Shared model-setup boilerplate (≥3 tests, ≥3 lines each) extracted into a helper in `// ─── Helpers` (Step 6a)
- [ ] Store fixtures use `store.normalize(model, record.toJSON())` without spread
- [ ] Stubs registered for `notifications` and `router` if used

**Assertions**
- [ ] Cancel/close tests assert list state before AND after (Step 10)
- [ ] Every interaction test has explicit pre-state and post-state assertions (Step 15)
- [ ] Post-state assertions verify content/values, not just existence
- [ ] Callback tests assert the exact argument, not just that the function was called
- [ ] Success tests assert the reloaded list reflects the mutation
- [ ] Icon assertions use `new RegExp(iconName)`
- [ ] No `.exists()` before chained assertions
- [ ] Tooltip tests trigger `mouseenter` before asserting content

**Mirage**
- [ ] Mirage routes set up for every network call the component makes on render and on interaction
- [ ] Reload-after-mutate tests use schema-backed GET handlers
