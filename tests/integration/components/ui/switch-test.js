import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const noop = () => {};
module('Integration | Component | ui/switch', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders switch with disabled state', async function (assert) {
    this.set('isDisabled', true);
    this.set('onClick', noop);
    await render(
      hbs`<Ui::Switch @isDisabled={{this.isDisabled}} @onClick={{this.onClick}}/>`
    );

    assert.dom(`[data-test-switch-input]`).hasAttribute('disabled');
  });
  test('it renders switch with disabled and checked', async function (assert) {
    this.set('isDisabled', true);
    this.set('isChecked', true);
    this.set('onClick', noop);
    await render(
      hbs`<Ui::Switch @isDisabled={{this.isDisabled}} @isChecked={{this.isChecked}} @onClick={{this.onClick}}/>`
    );

    assert.dom(`[data-test-switch-input]`).hasAttribute('disabled');
    assert.ok(this.element.querySelector(`[data-test-switch-input]`).checked);
  });

  test('it renders switch with checked state', async function (assert) {
    this.set('isDisabled', false);
    this.set('isChecked', true);
    this.set('onClick', noop);
    await render(
      hbs`<Ui::Switch @isDisabled={{this.isDisabled}} @isChecked={{this.isChecked}} @onClick={{this.onClick}}/>`
    );

    assert.dom(`[data-test-switch-input]`).doesNotHaveAttribute('disabled');
    assert.ok(this.element.querySelector(`[data-test-switch-input]`).checked);
  });
  test('it renders switch with un checked state', async function (assert) {
    this.set('isDisabled', false);
    this.set('isChecked', false);
    this.set('onClick', noop);
    await render(
      hbs`<Ui::Switch @isDisabled={{this.isDisabled}} @isChecked={{this.isChecked}} @onClick={{this.onClick}}/>`
    );

    assert.dom(`[data-test-switch-input]`).doesNotHaveAttribute('disabled');
    assert.notOk(
      this.element.querySelector(`[data-test-switch-input]`).checked
    );
  });

  test('it toggle switch state while clicking on it', async function (assert) {
    this.set('isDisabled', false);
    this.set('isChecked', false);
    this.set('onClick', noop);
    await render(
      hbs`<Ui::Switch @isDisabled={{this.isDisabled}} @isChecked={{this.isChecked}} @onClick={{this.onClick}}/>`
    );

    assert.notOk(
      this.element.querySelector(`[data-test-switch-input]`).checked
    );

    await click(`[data-test-switch-input]`);

    assert.ok(this.element.querySelector(`[data-test-switch-input]`).checked);
  });
});
