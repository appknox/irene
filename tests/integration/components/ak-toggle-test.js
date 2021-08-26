import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const noop = () => {};
module('Integration | Component | ak-toggle', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders default toggle input', async function (assert) {
    this.set('onClick', noop);
    await render(hbs`<AkToggle @onClick={{this.onClick}}/>`);

    assert.dom(`[data-test-toggle-input-slider]`).exists();
    assert.dom(`[data-test-toggle-input-label]`).doesNotExist();
  });

  test('it renders toggle with disabled state', async function (assert) {
    this.set('isDisabled', true);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @isDisabled={{this.isDisabled}} @onClick={{this.onClick}}/>`
    );

    assert.dom(`[data-test-toggle-input]`).hasAttribute('disabled');
  });
  test('it renders toggle with disabled and checked', async function (assert) {
    this.set('isDisabled', true);
    this.set('isChecked', true);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @isDisabled={{this.isDisabled}} @isChecked={{this.isChecked}} @onClick={{this.onClick}}/>`
    );

    assert.dom(`[data-test-toggle-input]`).hasAttribute('disabled');
    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);
  });

  test('it renders toggle with checked state', async function (assert) {
    this.set('isDisabled', false);
    this.set('isChecked', true);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @isDisabled={{this.isDisabled}} @isChecked={{this.isChecked}} @onClick={{this.onClick}}/>`
    );

    assert.dom(`[data-test-toggle-input]`).doesNotHaveAttribute('disabled');
    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);
  });
  test('it renders toggle with un checked state', async function (assert) {
    this.set('isDisabled', false);
    this.set('isChecked', false);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @isDisabled={{this.isDisabled}} @isChecked={{this.isChecked}} @onClick={{this.onClick}}/>`
    );

    assert.dom(`[data-test-toggle-input]`).doesNotHaveAttribute('disabled');
    assert.notOk(
      this.element.querySelector(`[data-test-toggle-input]`).checked
    );
  });

  test('it toggle state while clicking on it', async function (assert) {
    this.set('isDisabled', false);
    this.set('isChecked', false);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @isDisabled={{this.isDisabled}} @isChecked={{this.isChecked}} @onClick={{this.onClick}}/>`
    );

    assert.notOk(
      this.element.querySelector(`[data-test-toggle-input]`).checked
    );

    await click(`[data-test-toggle-input]`);

    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);
  });

  test('it toggle state while clicking on it', async function (assert) {
    this.set('isDisabled', false);
    this.set('isChecked', false);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @isDisabled={{this.isDisabled}} @isChecked={{this.isChecked}} @onClick={{this.onClick}}/>`
    );

    assert.notOk(
      this.element.querySelector(`[data-test-toggle-input]`).checked
    );

    await click(`[data-test-toggle-input]`);

    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);
  });

  test('it renders toggle with label', async function (assert) {
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @onClick={{this.onClick}}>
      Test
      </AkToggle>`
    );

    assert.dom(`[data-test-toggle-input-label]`).hasText('Test');
  });
});
