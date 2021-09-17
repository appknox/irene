import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-radio-button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders radio button without label', async function (assert) {
    await render(hbs`<AkRadioButton />`);
    const ELM_ID = this.element
      .querySelector(`[data-test-ak-radio-btn-input]`)
      .getAttribute('id');
    assert
      .dom(`[data-test-ak-radio-btn]`)
      .hasAttribute('for', ELM_ID, 'Label container has id reference');
    assert
      .dom(`[data-test-ak-radio-btn-label]`)
      .containsText('', 'Label has empty');
  });

  test('it renders radio button in checked state', async function (assert) {
    this.set('isChecked', true);
    await render(hbs`<AkRadioButton @isChecked={{this.isChecked}}/>`);
    console.log(
      this.element.querySelector(`[data-test-ak-radio-btn-input]`).checked
    );
    assert.true(
      this.element.querySelector(`[data-test-ak-radio-btn-input]`).checked,
      'Radio button checked'
    );
  });

  test('it renders radio button with given label', async function (assert) {
    await render(hbs`<AkRadioButton>Test</AkRadioButton>`);
    assert.dom(`[data-test-ak-radio-btn-label]`).hasText('Test');
  });

  test('it handle on change event', async function (assert) {
    this.set('value', 'test');
    this.set('onChange', (value) => {
      assert.equal(value, this.get('value'), 'Event trigger with given value');
    });
    await render(
      hbs`<AkRadioButton @onChange={{this.onChange}} @value={{this.value}}/>`
    );
    await click(`[data-test-ak-radio-btn]`);
  });
});
