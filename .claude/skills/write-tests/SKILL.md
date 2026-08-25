---
name: write-tests
description: Write QUnit tests for this project — unit, integration, or acceptance. Use when asked to write, add, extend or complete tests for a component, model, adapter, serializer, helper, route or user flow. Enforces the project's scenario matrix, selector, fixture and assertion standards.
---

# Write Tests

One standard, three test types. Follow every step in order — the output must be
predictable regardless of who or what invokes this skill.

## References — read on demand

| File                               | Read when                                                       |
| ---------------------------------- | --------------------------------------------------------------- |
| `references/unit-tests.md`         | Testing a model, adapter, serializer, helper or util            |
| `references/mirage.md`             | The subject makes network calls, or renders `AnalysisRisk::Tag` |
| `references/component-patterns.md` | AkSelect, AkToggle, AkButton, tooltip, popover, inputs          |
| `references/interaction-tests.md`  | The test clicks, fills, cancels or closes                       |

---

## Step 1 — Choose the test type

| Subject                                  | Type            | Location                               | Setup                  |
| ---------------------------------------- | --------------- | -------------------------------------- | ---------------------- |
| Model, adapter, serializer, helper, util | **unit**        | `tests/unit/<kind>/`                   | `setupTest`            |
| Component                                | **integration** | `tests/integration/components/<path>/` | `setupRenderingTest`   |
| Route, page, multi-page flow             | **acceptance**  | `tests/acceptance/`                    | `setupApplicationTest` |

Add `setupMirage(hooks)` whenever the subject touches the network.
Add `setupIntl(hooks, 'en')` whenever the subject renders translated text.

Test the smallest unit that owns the behaviour. Do not write an acceptance test
for logic a component test can cover.

---

## Step 2 — Build the scenario matrix

**Do this before writing any test.** Read the subject in full first:
`index.hbs` for every `data-test-*` and every conditional; `index.ts` for
tracked state, getters, actions, tasks, services and args. Then read what its
children render — a nested component pulls in services and network calls the
test must satisfy.

Enumerate every row that applies. Each row becomes at least one test.

| Source                    | Cases required                                         |
| ------------------------- | ------------------------------------------------------ |
| `{{#if}}` / `{{#unless}}` | Truthy **and** falsy                                   |
| `{{#each}}`               | Empty collection **and** populated                     |
| Getter                    | Every distinct output, including the empty/subset case |
| Action / task             | Success, failure, in-progress                          |
| Role or permission check  | Every role that changes output                         |
| Feature flag              | On **and** off                                         |
| Async data                | Loading, loaded, failed                                |
| Optional chaining / `??`  | Value present **and** absent                           |
| Adapter endpoint          | Success **and** error, per endpoint                    |
| Boundary values           | `null`, `undefined`, `''`, `0` where reachable         |

The suite is not complete until every enumerated case has a test.

---

## Step 3 — File skeleton

Identical for all three types; only the setup block differs.

```text
imports
stub classes
// ─── Selectors ───
const selectors = { ... }
// ─── Template ───          (integration only)
const TEMPLATE = hbs`...`
// ─── Test suite ───
module('<Type> | <Subject>', function (hooks) { ... })
```

Group tests under dividers:

```js
// ─── Section title ─────────────────────────────────────────────────────────────
```

One `selectors` object and one `TEMPLATE` per file, both outside the module.
Never inline a `data-test-*` string or an `hbs` block inside a test body.

---

## Step 4 — Selectors

- Always `data-test-*`. Never a class, id, or generic component selector
  (`[data-test-ak-typography]`). CSS-module classes are hashed — matching them
  matches build output, not intent.
- Missing attribute? **Add it to the component template first.**
- Dynamic selectors are functions:
  `row: (label) => \`[data-test-..="${label}"]\``
- Scope children: `assert.dom(childSelector, rowElement)`

---

## Step 5 — Setup and stubs

Register stubs **first**, before any `lookup()` or `service.load()`. Anything
that resolves a service first caches the real one, and the subject then talks to
an instance the assertions never see.

```js
hooks.beforeEach(async function () {
  this.owner.register('service:notifications', NotificationsStub);
  // ...everything else
});
```

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
  setDefaultAutoClear() {}
}
```

Include every method the subject calls — a missing `setDefaultAutoClear` or
`info` throws at runtime. Router must be unregistered before re-registering:

```js
this.owner.unregister('service:router');
this.owner.register('service:router', RouterStub);
```

Mirage is not optional. Every rendering, unit and acceptance test that uses
a record calls `setupMirage(hooks)`, and every record it uses has a Mirage model
and factory. If the model does not exist yet, add it under `mirage/models/` and
`mirage/factories/` before writing the test — do not stub a plain object to get
around a missing one.

Org and `me` setup: `references/mirage.md`

---

## Step 6 — Fixtures

Every record comes from a Mirage factory. Never hand-write a payload literal,
and never build one in a helper.

```js
const record = this.server.create('model', 'trait', { pinned: value });
const model = store.push(store.normalize('model', record.toJSON()));
```

- **Never spread** `toJSON()`.
- JSON:API serializers (user, vulnerability) need the wrapper, or you get
  `singularize expects to receive a non-empty string`:
  `{ attributes: record.toJSON(), id: record.id, type: 'user' }`
- Check the serializer for a custom `primaryKey` before writing a factory.
- **Never assert a faker value** — read it off the created record.
- **Pin any factory default an assertion depends on.** `analysis` and
  `analysis-overview` randomise `overridden_risk`; leaving it unpinned makes
  tests pass and fail on alternate runs.

Use `this.setProperties({ ... })` to set several test properties at once in
`beforeEach`.

### Writing a factory

Values come from `faker`, not hardcoded strings. Use real enums
(`ENUMS.RISK.VALUES`, `OverrideRequestStatus`) rather than numeric literals, and
`trait(...)` for named state variants.

**A property that must differ per record has to be a function.** A bare
`faker.x()` is evaluated once when the module loads, so every record created in
every test gets the same value.

```js
export const MY_FACTORY_DEF = {
  // ❌ evaluated once at import — identical on every record
  created_on: faker.date.past(),
  status: faker.helpers.arrayElement(ENUMS.ANALYSIS.VALUES),

  // ✅ evaluated per record
  created_on: () => faker.date.past(),
  name() {
    return faker.company.name();
  },
};
```

Either form works — arrow property or method shorthand. Use a plain value only
when every record genuinely should share it (`status: OverrideRequestStatus.PENDING`
inside a trait, `analysis_override_criteria: null`).

Several existing factories still use the eager form, `analysis-overview` among
them. Do not copy it.

No factory yet? Create `mirage/models/<model>.ts` and
`mirage/factories/<model>.ts` before writing the test.

---

## Step 7 — Assert every UI fabric

For each element the subject renders, assert the row below. Existence alone is
never sufficient when the element has content or state.

| Element           | Required assertions                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| Text              | `hasText(t('key'))` — the resolved translation, not a literal                                                       |
| Heading / label   | `hasText(t('key'))`                                                                                                 |
| Button            | Label text, disabled state, and the effect of clicking it                                                           |
| Link              | `href` **and** text                                                                                                 |
| Input / textarea  | Value, placeholder, and error state both ways                                                                       |
| Icon              | `hasAttribute('icon', /name/)` — regex literal for a constant, `new RegExp(v)` for a variable. Never a plain string |
| Toggle / checkbox | `isChecked` and `isDisabled`                                                                                        |
| Select            | Option list (count + labels) **and** the effect of selecting                                                        |
| Tooltip           | Hover, then assert the content                                                                                      |
| Loader            | Appears **and** disappears                                                                                          |
| Empty state       | Rendered when the collection is empty                                                                               |
| Error state       | Rendered with the exact message                                                                                     |

### Collections — pick one depth, apply it consistently

Always assert the item count. Then choose **one** of these and stay with it:

- **Every item.** Loop and assert each one with scoped selectors.

  ```js
  const rows = findAll(selectors.row);
  assert.strictEqual(rows.length, items.length);

  items.forEach((item, i) => {
    assert.dom(selectors.name, rows[i]).hasText(item.name);
    assert.dom(selectors.toggle, rows[i]).isChecked();
  });
  ```

- **One item, exhaustively.** Assert every field and state of a single
  representative row.

Do not skim shallowly across several items — that catches neither a per-item
rendering bug nor a missing field.

### Assertion rules

- **No `.exists()` before a chained assertion.** `.hasText()` already fails when
  the element is absent.
- `.exists()` / `.doesNotExist()` alone is only correct when the element has no
  content or state to check.
- **Notifications: exact message, never `assert.ok`.**
  `assert.strictEqual(notify.errorMsg, t('key'), 'shows error notification')`
  A bare `new Response(500)` through the DRF adapter always yields
  `'The backend responded with an error'`; a 4xx surfaces `payload.detail`.
- HTML translations (`htmlSafe=true`): use
  `compareInnerHTMLWithIntlTranslation` from `irene/tests/test-utils`.
- Add `assert.expect(n)` to any test with a global-failure risk — it turns a
  silent async failure into a hard one.

---

## Step 8 — Interactions

Every interaction test asserts before and after:

1. **Pre-state** — content, and the callback not yet fired
   (`assert.strictEqual(this.calledWith, null)`)
2. The action
3. **Post-state** — the changed content, and the exact callback argument

Cancel and close tests must assert the original state is unchanged.

Errors travelling through nested ember-concurrency tasks can settle after
`click()` resolves — poll rather than assume:

```js
await waitUntil(() => notify.errorMsg, { timeout: 2000 });
```

Detail in `references/interaction-tests.md`.

---

## Step 9 — Repeating cases

Records that every test in a module needs are created once in `beforeEach` and
read from `this`. Repeating the same three `server.create` calls at the top of
eight tests is the signal to move them.

Keep a record in the test body when only that test needs it, or when it needs a
different trait or a pinned value the others must not see.

Use `test.each` when cases share assertion logic. Plain descriptive title
covering the group — no `${0}` placeholders, they do not work here.

```js
test.each(
  'renders the button per role',
  [
    [ownerRole, true],
    [memberRole, false],
  ],
  async function (assert, [role, visible]) {
    assert.dom(selectors.btn)[visible ? 'exists' : 'doesNotExist']();
  }
);
```

---

## Step 10 — Do not test

- **Design measurements.** No assertions on padding, margin, colour,
  `border-radius`, `font-size` or any computed style. They restate the
  stylesheet, break on every visual tweak, and prove nothing about behaviour.
  Assert the text, the state and the presence of the element instead. Either
  write meaningful assertions or delete the file.
- Skeleton loaders — cover the loading state on the parent
- AkPopover / tooltip internals
- A child's full interaction flow from its parent when the child has its own
  suite — the parent asserts only that the right child rendered, in the right
  state

---

## Step 11 — Checklist

- [ ] Every row of the Step 2 matrix has a test
- [ ] Children's service and network needs set up
- [ ] `selectors` and `TEMPLATE` outside the module; nothing inlined
- [ ] Only `data-test-*` selectors; attributes added to templates where missing
- [ ] Stubs registered before any other lookup; every called method stubbed
- [ ] Fixtures from factories; JSON:API wrapper where needed; no spread
- [ ] Non-deterministic factory defaults pinned; no hardcoded faker values
- [ ] New factory properties use `faker`, wrapped in a function where each
      record needs its own value
- [ ] Every rendered element asserted per the Step 7 table
- [ ] Collections: count asserted, plus every item **or** one item exhaustively
- [ ] No `.exists()` before a chain; exact notification messages; regex icons
- [ ] Interaction tests assert pre-state and post-state with exact callback args

---

## Step 12 — Comments

Section dividers between test groups are fine — they are the file's structure.
Do not add explanatory comments above individual tests, assertions or fixtures;
the test name already says what it covers.

---

## Step 13 — Verify

```bash
npx eslint <test file> --fix
```

Then ask the user to run the suite. Do not run it yourself.
