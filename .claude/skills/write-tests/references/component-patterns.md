# Component Interaction Patterns

Reference for `write-tests`. Read when the component uses these UI primitives.

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

## AkToggle

`...attributes` lands on the wrapper span; the input carries
`data-test-toggle-input`:

```js
toggleInput: '[data-test-myToggle] [data-test-toggle-input]';
```

## AkButton disabled

`AkButton` applies `...attributes` **before** its own `disabled` binding, so a
passed-through `disabled` attribute is overwritten. Always use `@disabled=`.
