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

    await render(hbs`<AkCheckbox @checked={{this.checked}} />`);

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.dom('[data-test-checkbox-icon]').exists();
  });

  test('it renders ak-checkbox indeterminate', async function (assert) {
    this.setProperties({
      checked: false,
      indeterminate: true,
    });

    await render(
      hbs`<AkCheckbox @checked={{this.checked}} @indeterminate={{this.indeterminate}} />`
    );

    const checkbox = find('[data-test-checkbox]');

    assert.dom(checkbox).exists().isNotChecked();

    assert.strictEqual(checkbox.dataset.indeterminate, 'true');
  });

  test('it renders ak-checkbox with form-control-label', async function (assert) {
    this.setProperties({
      checked: false,
      label: 'test label',
    });

    await render(hbs`
        <AkFormControlLabel @label={{this.label}} as |fcl|>
            <AkCheckbox @checked={{this.checked}} @disabled={{fcl.disabled}} />
        </AkFormControlLabel>
    `);

    assert.dom('[data-test-ak-form-label]').exists().hasText(this.label);

    assert.dom('[data-test-checkbox]').exists().isNotChecked().isNotDisabled();
    assert.dom('[data-test-checkbox-icon]').exists();
  });

  test('test ak-checkbox check toggle', async function (assert) {
    await render(hbs`<AkCheckbox />`);

    assert.dom('[data-test-checkbox]').exists().isNotChecked();

    const checkbox = find('[data-test-checkbox]');

    await triggerEvent(checkbox, 'click');

    assert.dom('[data-test-checkbox]').isChecked();

    await triggerEvent('[data-test-checkbox]', 'click');

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
  });

  test('test ak-checkbox with onchange handler', async function (assert) {
    this.setProperties({
      checked: false,
      event: null,
      onChange: (event) => {
        this.set('event', event);
      },
    });

    await render(
      hbs`<AkCheckbox @checked={{this.checked}} @onChange={{this.onChange}} />`
    );

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.false(this.checked);
    assert.strictEqual(this.event, null);

    const checkbox = find('[data-test-checkbox]');

    await triggerEvent(checkbox, 'click');

    assert.dom('[data-test-checkbox]').isChecked();
    assert.true(this.checked);
    assert.strictEqual(this.event.type, 'change');

    this.set('event', null);

    await triggerEvent('[data-test-checkbox]', 'click');

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
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
    assert.strictEqual(checkbox.dataset.indeterminate, 'false');
    assert.true(this.checked);

    await triggerEvent('[data-test-checkbox]', 'click');

    assert.dom('[data-test-checkbox]').exists().isNotChecked();
    assert.strictEqual(checkbox.dataset.indeterminate, 'false');
    assert.false(this.checked);

    // testing when checkbox was unchecked then went to indeterminate
    // so if again clicked it should be checked
    this.set('indeterminate', true);

    assert.strictEqual(checkbox.dataset.indeterminate, 'true');

    await triggerEvent(checkbox, 'click');

    assert.dom('[data-test-checkbox]').isChecked();
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

  test('it renders ak-checkbox readonly', async function (assert) {
    this.setProperties({
      checked: true,
      readonly: true,
      clickEvent: null,
      changeEvent: null,
      handleChange: (event) => {
        this.set('changeEvent', event);
      },
      handleClick: (event) => {
        this.set('clickEvent', event);
      },
    });

    await render(
      hbs`<AkCheckbox @onClick={{this.handleClick}} @onChange={{this.handleChange}} @checked={{this.checked}} @readonly={{this.readonly}} />`
    );

    assert.dom('[data-test-checkbox]').exists().isChecked().isNotDisabled();
    assert.notOk(this.changeEvent);
    assert.notOk(this.clickEvent);

    await triggerEvent('[data-test-checkbox]', 'click');

    assert.dom('[data-test-checkbox]').exists().isChecked().isNotDisabled();
    assert.notOk(this.changeEvent);
    assert.notOk(this.clickEvent);
  });

  test('it renders ak-checkbox with click handler', async function (assert) {
    this.setProperties({
      checked: true,
      clickEvent: null,
      handleClick: (event) => {
        this.set('clickEvent', event);
      },
    });

    await render(
      hbs`<AkCheckbox @onClick={{this.handleClick}} @checked={{this.checked}} />`
    );

    assert.dom('[data-test-checkbox]').exists().isChecked().isNotDisabled();
    assert.true(this.checked);
    assert.notOk(this.clickEvent);

    await triggerEvent('[data-test-checkbox]', 'click');

    assert.dom('[data-test-checkbox]').exists().isNotChecked().isNotDisabled();
    assert.false(this.checked);
    assert.ok(this.clickEvent);
    assert.strictEqual(this.clickEvent.type, 'click');
  });
});
