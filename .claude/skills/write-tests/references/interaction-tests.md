# Interaction Test Structure

Reference for `write-tests`. Read when writing any test that clicks, fills, cancels or closes.

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

## Async settling

Errors propagating through nested ember-concurrency tasks can settle _after_
`click()` resolves. Poll rather than assume:

```js
await waitUntil(() => notify.errorMsg, { timeout: 2000 });
```
