import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-toggle', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders default toggle input', async function (assert) {
    await render(hbs`<AkToggle />`);

    assert.dom('[data-test-toggle-input-slider]').exists();
  });

  test('it renders toggle with disabled state', async function (assert) {
    this.set('disabled', true);

    await render(hbs`<AkToggle @disabled={{this.disabled}} />`);

    assert.dom('[data-test-toggle-input]').hasAttribute('disabled');
  });

  test('it renders toggle with disabled and checked', async function (assert) {
    this.set('disabled', true);
    this.set('checked', true);

    await render(
      hbs`<AkToggle @disabled={{this.disabled}} @checked={{this.checked}} />`
    );

    assert.dom('[data-test-toggle-input]').hasAttribute('disabled');
    assert.ok(this.element.querySelector('[data-test-toggle-input]').checked);
  });

  test('it renders toggle with checked state', async function (assert) {
    this.set('disabled', false);
    this.set('checked', true);

    await render(
      hbs`<AkToggle @disabled={{this.disabled}} @checked={{this.checked}} />`
    );

    assert.dom('[data-test-toggle-input]').doesNotHaveAttribute('disabled');
    assert.ok(this.element.querySelector('[data-test-toggle-input]').checked);
  });

  test('it renders toggle with unchecked state', async function (assert) {
    this.set('disabled', false);
    this.set('checked', false);

    await render(
      hbs`<AkToggle @disabled={{this.disabled}} @checked={{this.checked}} />`
    );

    assert.dom('[data-test-toggle-input]').doesNotHaveAttribute('disabled');
    assert.notOk(
      this.element.querySelector('[data-test-toggle-input]').checked
    );
  });

  test('it toggle state while clicking on it', async function (assert) {
    this.set('disabled', false);
    this.set('checked', false);

    await render(
      hbs`<AkToggle @disabled={{this.disabled}} @checked={{this.checked}} />`
    );

    assert.notOk(
      this.element.querySelector('[data-test-toggle-input]').checked
    );

    await click('[data-test-toggle-input]');

    assert.ok(this.element.querySelector('[data-test-toggle-input]').checked);
  });

  test('test toggle with onchange handler uncontrolled', async function (assert) {
    let checked = false;
    let event = null;

    this.set('onChange', function (e, val) {
      checked = val;
      event = e;
    });

    await render(hbs`<AkToggle @onChange={{this.onChange}} />`);

    assert.false(checked);
    assert.strictEqual(event, null);
    assert.dom('[data-test-toggle-input]').isNotChecked();

    await click('[data-test-toggle-input]');

    assert.true(checked);
    assert.strictEqual(event.type, 'change');
    assert.dom('[data-test-toggle-input]').isChecked();

    await click('[data-test-toggle-input]');

    assert.false(checked);
    assert.strictEqual(event.type, 'change');
    assert.dom('[data-test-toggle-input]').isNotChecked();
  });

  test('test toggle with onchange handler controlled', async function (assert) {
    this.setProperties({
      checked: false,
      onChange: (event, checked) => {
        this.set('checked', checked);
      },
    });

    await render(
      hbs`<AkToggle @checked={{this.checked}} @onChange={{this.onChange}} />`
    );

    assert.false(this.checked);
    assert.dom('[data-test-toggle-input]').isNotChecked();

    await click('[data-test-toggle-input]');

    assert.true(this.checked);
    assert.dom('[data-test-toggle-input]').isChecked();

    await click('[data-test-toggle-input]');

    assert.false(this.checked);
    assert.dom('[data-test-toggle-input]').isNotChecked();
  });
});
