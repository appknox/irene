import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it should render checkbox without label', async function (assert) {
    await render(hbs`<AkCheckbox />`);
    const ELM_ID = this.element
      .querySelector(`[data-test-checkbox-input]`)
      .getAttribute('id');
    assert
      .dom(`[data-test-checkbox]`)
      .hasAttribute('for', ELM_ID, 'Label container has id reference');

    assert.dom(`[data-test-checkbox]`).doesNotIncludeText();
  });

  test('it should render checkbox in default checked state', async function (assert) {
    this.set('isChecked', true);
    await render(hbs`<AkCheckbox @isChecked={{this.isChecked}}/>`);
    assert.true(
      this.element.querySelector(`[data-test-checkbox-input]`).checked,
      'Checkbox in default checked state'
    );
  });

  test('it should render checkbox in default unchecked state', async function (assert) {
    this.set('isChecked', false);
    await render(hbs`<AkCheckbox @isChecked={{this.isChecked}}/>`);
    assert.false(
      this.element.querySelector(`[data-test-checkbox-input]`).checked,
      'Checkbox in default unchecked state'
    );
  });

  test('it should render checkbox with given label', async function (assert) {
    await render(hbs`<AkCheckbox>Test</AkCheckbox>`);
    assert.dom(`[data-test-checkbox]`).hasText('Test');
  });

  test('it should handle on input event and toggle checkbox state', async function (assert) {
    this.set('isChecked', true);
    this.set('onToggle', () => {
      this.set('isChecked', false);
      assert.false(
        this.element.querySelector(`[data-test-checkbox-input]`).checked,
        'Checkbox state changes to unchecked'
      );
    }).bind(this);
    await render(
      hbs`<AkCheckbox {{on "input" this.onToggle}} @isChecked={{this.isChecked}}/>`
    );
    assert.true(
      this.element.querySelector(`[data-test-checkbox-input]`).checked,
      'Checkbox in default checked state'
    );
    await click(`[data-test-checkbox-input]`);
  });

  test('it should render checkbox in default disabled checked state', async function (assert) {
    this.set('isDisabled', true);
    this.set('isChecked', true);
    await render(
      hbs`<AkCheckbox @isChecked={{this.isChecked}} @isDisabled={{this.isDisabled}}/>`
    );
    assert.true(
      this.element.querySelector(`[data-test-checkbox-input]`).checked,
      'Checkbox in default checked state'
    );
    assert.dom(`[data-test-checkbox-input]`).hasAttribute('disabled');
  });

  test('it should render checkbox in default disabled unchecked state', async function (assert) {
    this.set('isDisabled', true);
    this.set('isChecked', false);
    await render(
      hbs`<AkCheckbox @isChecked={{this.isChecked}} @isDisabled={{this.isDisabled}}/>`
    );
    assert.false(
      this.element.querySelector(`[data-test-checkbox-input]`).checked,
      'Checkbox in default checked state'
    );
    assert.dom(`[data-test-checkbox-input]`).hasAttribute('disabled');
  });
});
