import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { triggerEvent, render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-checkbox standlone', async function (assert) {
    this.setProperties({
      checked: false,
    });

    await render(hbs`<AkCheckbox />`);

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-unchecked]').exists();
  });

  test('it renders ak-checkbox indeterminate', async function (assert) {
    this.setProperties({
      checked: false,
      indeterminate: true,
    });

    await render(
      hbs`<AkCheckbox @checked={{this.checked}} @indeterminate={{this.indeterminate}} />`
    );

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-indeterminate]').exists();
  });

  test('it renders ak-checkbox with form-control-label', async function (assert) {
    this.setProperties({
      checked: false,
      label: 'test label',
    });

    await render(hbs`
        <AkFormControlLabel @label={{this.label}} as |fcl|>
            <AkCheckbox @disabled={{fcl.disabled}} />
        </AkFormControlLabel>
    `);

    assert.dom('[data-test-ak-form-label]').exists().hasText(this.label);

    assert.dom('[data-test-checkbox]').exists().isNotChecked().isNotDisabled();
    assert.dom('[data-test-checkbox-unchecked]').exists();
  });

  test('test ak-checkbox uncontrolled', async function (assert) {
    await render(hbs`<AkCheckbox />`);

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-unchecked]').exists();

    const checkbox = find('[data-test-checkbox]');

    await triggerEvent(checkbox, 'click');

    assert.dom('[data-test-checkbox]').isChecked();
    assert.dom('[data-test-checkbox-checked]').exists();

    await triggerEvent('[data-test-checkbox]', 'click');

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-unchecked]').exists();
  });

  test('test ak-checkbox uncontrolled with onchange handler', async function (assert) {
    this.setProperties({
      checked: false,
      event: null,
      onChange: (event, checked) => {
        this.set('checked', checked);
        this.set('event', event);
      },
    });

    await render(hbs`<AkCheckbox @onChange={{this.onChange}} />`);

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-unchecked]').exists();
    assert.false(this.checked);
    assert.strictEqual(this.event, null);

    const checkbox = find('[data-test-checkbox]');

    await triggerEvent(checkbox, 'click');

    assert.dom('[data-test-checkbox]').isChecked();
    assert.dom('[data-test-checkbox-checked]').exists();
    assert.true(this.checked);
    assert.strictEqual(this.event.type, 'change');

    this.set('event', null);

    await triggerEvent('[data-test-checkbox]', 'click');

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-unchecked]').exists();
    assert.false(this.checked);
    assert.strictEqual(this.event.type, 'change');
  });

  test('test ak-checkbox controlled with onchange handler', async function (assert) {
    this.setProperties({
      checked: false,
      event: null,
      onChange: (event, checked) => {
        this.set('checked', checked);
        this.set('event', event);
      },
    });

    await render(
      hbs`<AkCheckbox @checked={{this.checked}} @onChange={{this.onChange}} />`
    );

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-unchecked]').exists();
    assert.false(this.checked);
    assert.strictEqual(this.event, null);

    const checkbox = find('[data-test-checkbox]');

    await triggerEvent(checkbox, 'click');

    assert.dom('[data-test-checkbox]').isChecked();
    assert.dom('[data-test-checkbox-checked]').exists();
    assert.true(this.checked);
    assert.strictEqual(this.event.type, 'change');

    this.set('event', null);

    await triggerEvent('[data-test-checkbox]', 'click');

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-unchecked]').exists();
    assert.false(this.checked);
    assert.strictEqual(this.event.type, 'change');
  });

  test('test ak-checkbox with indeterminate state', async function (assert) {
    this.setProperties({
      checked: false,
      indeterminate: false,
      onChange: (event, checked) => {
        this.set('checked', checked);

        // trying to simulate real case
        // checked and indeterminate won't be true at same time
        if (checked) {
          this.set('indeterminate', false);
        }
      },
    });

    await render(
      hbs`<AkCheckbox @checked={{this.checked}} @indeterminate={{this.indeterminate}} @onChange={{this.onChange}} />`
    );

    const checkbox = find('[data-test-checkbox]');

    await triggerEvent(checkbox, 'click');

    assert.dom('[data-test-checkbox]').isChecked();
    assert.dom('[data-test-checkbox-checked]').exists();
    assert.strictEqual(checkbox.dataset.indeterminate, 'false');
    assert.true(this.checked);

    await triggerEvent('[data-test-checkbox]', 'click');

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-unchecked]').exists();
    assert.strictEqual(checkbox.dataset.indeterminate, 'false');
    assert.false(this.checked);

    // testing when checkbox was unchecked then went to indeterminate
    // so if again clicked it should be checked
    this.set('indeterminate', true);

    assert.strictEqual(checkbox.dataset.indeterminate, 'true');
    assert.dom('[data-test-checkbox-indeterminate]').exists();

    await triggerEvent(checkbox, 'click');

    assert.dom('[data-test-checkbox]').isChecked();
    assert.dom('[data-test-checkbox-checked]').exists();
    assert.strictEqual(checkbox.dataset.indeterminate, 'false');
    assert.true(this.checked);

    // testing when checkbox was checked then went to indeterminate
    // so if again clicked it should be checked
    this.set('indeterminate', true);

    assert.strictEqual(checkbox.dataset.indeterminate, 'true');
    assert.dom('[data-test-checkbox-indeterminate]').exists();

    await triggerEvent(checkbox, 'click');

    assert.dom('[data-test-checkbox]').isChecked();
    assert.dom('[data-test-checkbox-checked]').exists();
    assert.strictEqual(checkbox.dataset.indeterminate, 'false');
    assert.true(this.checked);
  });

  test('it renders ak-checkbox disabled', async function (assert) {
    this.setProperties({
      checked: false,
      disabled: true,
    });

    await render(
      hbs`<AkCheckbox @checked={{this.checked}} @disabled={{this.disabled}} />`
    );

    assert.dom('[data-test-checkbox]').exists().isNotChecked().isDisabled();

    this.set('checked', true);

    assert.dom('[data-test-checkbox]').exists().isChecked().isDisabled();
  });
});
