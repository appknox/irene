import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import styles from 'irene/components/ak-input/text/index.scss';

module('Integration | Component | ak-input/text', function (hooks) {
  setupRenderingTest(hooks);

  test('it should render input box with given value', async function (assert) {
    this.set('value', 'input value');
    await render(hbs`<AkInput::Text @value={{this.value}}/>`);

    assert.dom(`[data-test-ak-input-text]`).hasValue(this.value);
  });

  test('it should render input box in disabled state', async function (assert) {
    this.set('isDisabled', true);
    await render(hbs`<AkInput::Text @isDisabled={{this.isDisabled}}/>`);

    assert.dom(`[data-test-ak-input-text]`).hasAttribute('disabled');
  });

  test('it should render input box in read only state', async function (assert) {
    this.set('isReadOnly', true);
    await render(hbs`<AkInput::Text @isReadOnly={{this.isReadOnly}}/>`);
    assert.dom(`[data-test-ak-input-text]`).hasClass(styles['read-only']);
  });

  test('it should render input box in error state with given msg', async function (assert) {
    this.set('isInputError', true);
    await render(
      hbs`<AkInput::Text @isInputError={{this.isInputError}}>error msg</AkInput::Text>`
    );

    assert.dom(`[data-test-ak-input-text]`).hasClass(styles['error']);
    assert.dom(`[data-test-ak-input-text-error]`).exists();
  });
});
