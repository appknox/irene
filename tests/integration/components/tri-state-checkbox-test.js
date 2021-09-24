import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import styles from 'irene/components/tri-state-checkbox/index.scss';

module('Integration | Component | tri-state-checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it does not render component if label is not passed', async function (assert) {
    await render(hbs`<TriStateCheckbox />`);
    assert.dom('[data-test-check]').doesNotExist();

    const container = this.element.querySelector('[data-test-container]');
    assert.equal(container.clientHeight, 0);
  });

  test('it toggles value on checkbox click', async function (assert) {
    this.set('label', 'Test');
    this.set('value', true);
    this.set('onToggle', () => {});
    this.set('onOverrideReset', () => {});
    this.set('isToggleRunning', false);
    this.set('isOverridden', false);

    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );

    const checkbox = this.element.querySelector('[data-test-input]');
    assert.equal(checkbox.checked, true);

    await click(checkbox);
    assert.equal(checkbox.checked, false);

    await click(checkbox);
    assert.equal(checkbox.checked, true);
  });

  test('it toggles value on label click', async function (assert) {
    this.set('label', 'Test');
    this.set('value', true);
    this.set('onToggle', () => {});
    this.set('onOverrideReset', () => {});
    this.set('isToggleRunning', false);
    this.set('isOverridden', false);

    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );

    const checkbox = this.element.querySelector('[data-test-input]');
    assert.equal(checkbox.checked, true);

    const label = this.element.querySelector('[data-test-label]');

    await click(label);
    assert.equal(checkbox.checked, false);

    await click(label);
    assert.equal(checkbox.checked, true);
  });

  test('it should render label title if passed', async function (assert) {
    this.set('label', 'Test label');
    this.set('value', true);
    this.set('onToggle', () => {});
    this.set('onOverrideReset', () => {});
    this.set('isToggleRunning', false);
    this.set('isOverridden', false);

    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );

    let label = this.element.querySelector('[data-test-label]');
    assert.equal(label.title, '');

    this.set('title', 'Test title');
    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @title={{this.title}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );

    label = this.element.querySelector('[data-test-label]');
    assert.equal(label.title, 'Test title');
  });

  test('it toggles value on label click', async function (assert) {
    this.set('label', 'Test');
    this.set('value', true);
    this.set('onToggle', () => {});
    this.set('onOverrideReset', () => {});
    this.set('isToggleRunning', false);
    this.set('isOverridden', false);

    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );

    const checkbox = this.element.querySelector('[data-test-input]');
    assert.equal(checkbox.checked, true);

    const label = this.element.querySelector('[data-test-label]');

    await click(label);
    assert.equal(checkbox.checked, false);

    await click(label);
    assert.equal(checkbox.checked, true);
  });

  test('it should render progress spinner based on isToggleRunning value', async function (assert) {
    this.set('label', 'Test');
    this.set('value', true);
    this.set('onToggle', () => {});
    this.set('onOverrideReset', () => {});
    this.set('isOverridden', false);

    this.set('isToggleRunning', true);
    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );
    assert.dom('[data-test-progress-spinner]').exists();

    this.set('isToggleRunning', false);
    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );
    assert.dom('[data-test-progress-spinner]').doesNotExist();
  });

  test('it should render switch style based on isOverridden value', async function (assert) {
    this.set('label', 'Test');
    this.set('value', true);
    this.set('onToggle', () => {});
    this.set('onOverrideReset', () => {});
    this.set('isToggleRunning', false);

    this.set('isOverridden', false);
    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );
    assert.dom('[data-test-check]').hasClass(styles['inherited']);
    assert.dom('[data-test-check]').doesNotHaveClass(styles['overridden']);

    this.set('isOverridden', true);
    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );
    assert.dom('[data-test-check]').doesNotHaveClass(styles['inherited']);
    assert.dom('[data-test-check]').hasClass(styles['overridden']);
  });

  test('it should render reset button based on isOverridden value', async function (assert) {
    this.set('label', 'Test');
    this.set('value', true);
    this.set('onToggle', () => {});
    this.set('onOverrideReset', () => {});
    this.set('isToggleRunning', false);

    this.set('isOverridden', true);
    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );
    assert.dom('[data-test-reset]').exists();

    this.set('isOverridden', false);
    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );
    assert.dom('[data-test-reset]').doesNotExist();
  });

  test('it should execute onOverrideReset function on reset button click', async function (assert) {
    this.set('label', 'Test');
    this.set('value', true);
    this.set('onToggle', () => {});
    this.set('isToggleRunning', false);
    this.set('isOverridden', true);

    let flag = 1;
    this.set('onOverrideReset', function reset() {
      flag = 0;
    });

    await render(
      hbs`<TriStateCheckbox @label={{this.label}} @value={{this.value}} @onToggle={{this.onToggle}} @onOverrideReset={{this.onOverrideReset}} @isToggleRunning={{this.isToggleRunning}} @isOverridden={{this.isOverridden}} />`
    );

    assert.equal(flag, 1);

    const reset = this.element.querySelector('[data-test-reset]');
    await click(reset);

    assert.equal(flag, 0);
  });
});
