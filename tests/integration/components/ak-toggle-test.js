import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

const noop = () => {};
module('Integration | Component | ak-toggle', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders default toggle input', async function (assert) {
    this.set('onClick', noop);
    await render(hbs`<AkToggle @onClick={{this.onClick}}/>`);

    assert.dom('[data-test-toggle-input-slider]').exists();
  });

  test('it renders toggle with disabled state', async function (assert) {
    this.set('disabled', true);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @disabled={{this.disabled}} @onClick={{this.onClick}}/>`
    );

    assert.dom('[data-test-toggle-input]').hasAttribute('disabled');
  });

  test('it renders toggle with disabled and checked', async function (assert) {
    this.set('disabled', true);
    this.set('checked', true);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @disabled={{this.disabled}} @checked={{this.checked}} @onClick={{this.onClick}}/>`
    );

    assert.dom('[data-test-toggle-input]').hasAttribute('disabled');
    assert.ok(this.element.querySelector('[data-test-toggle-input]').checked);
  });

  test('it renders toggle with checked state', async function (assert) {
    this.set('disabled', false);
    this.set('checked', true);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @disabled={{this.disabled}} @checked={{this.checked}} @onClick={{this.onClick}}/>`
    );

    assert.dom('[data-test-toggle-input]').doesNotHaveAttribute('disabled');
    assert.ok(this.element.querySelector('[data-test-toggle-input]').checked);
  });

  test('it renders toggle with unchecked state', async function (assert) {
    this.set('disabled', false);
    this.set('checked', false);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @disabled={{this.disabled}} @checked={{this.checked}} @onClick={{this.onClick}}/>`
    );

    assert.dom('[data-test-toggle-input]').doesNotHaveAttribute('disabled');
    assert.notOk(
      this.element.querySelector('[data-test-toggle-input]').checked
    );
  });

  test('it toggle state while clicking on it', async function (assert) {
    this.set('disabled', false);
    this.set('checked', false);
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @disabled={{this.disabled}} @checked={{this.checked}} @onClick={{this.onClick}}/>`
    );

    assert.notOk(
      this.element.querySelector('[data-test-toggle-input]').checked
    );

    await click('[data-test-toggle-input]');

    assert.ok(this.element.querySelector('[data-test-toggle-input]').checked);
  });

  test('it renders toggle with label and placement left', async function (assert) {
    this.set('onClick', noop);
    await render(hbs`<AkToggle @onClick={{this.onClick}} @label="TestLeft" />`);

    assert
      .dom(`[data-test-toggle-input-label]`)
      .hasText('TestLeft')
      .hasClass(/toggle-label-left/i);

    assert
      .dom('[data-test-toggle-input-label-container]')
      .doesNotHaveStyle({ 'flex-direction': 'row-reverse' });
  });

  test('it renders toggle with label and placement right', async function (assert) {
    this.set('onClick', noop);
    await render(
      hbs`<AkToggle @onClick={{this.onClick}} @label="TestRight" @labelPlacement="right" />`
    );

    assert
      .dom(`[data-test-toggle-input-label]`)
      .hasText('TestRight')
      .hasClass(/toggle-label-right/i);

    assert
      .dom('[data-test-toggle-input-label-container]')
      .hasStyle({ 'flex-direction': 'row-reverse' });
  });
});
