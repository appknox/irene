import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-text-field', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders text field', async function (assert) {
    this.setProperties({
      label: 'Test label',
      value: '',
      placeholder: 'testing',
    });

    await render(
      hbs`<AkTextField @label={{this.label}} @value={{this.value}} @placeholder={{this.placeholder}} />`
    );

    assert.dom('[data-test-form-label]').exists().hasText(this.label);

    assert
      .dom('[data-test-text-input]')
      .exists()
      .hasNoValue()
      .hasAttribute('placeholder');
  });

  test('it renders text field disabled', async function (assert) {
    this.setProperties({
      label: 'Test label',
      value: '',
      placeholder: 'testing',
      disabled: true,
    });

    await render(
      hbs`<AkTextField @label={{this.label}} @value={{this.value}} @placeholder={{this.placeholder}} @disabled={{this.disabled}} />`
    );

    assert.dom('[data-test-text-input]').exists().isDisabled();

    this.set('disabled', false);

    assert.dom('[data-test-text-input]').isNotDisabled();
  });

  test('test text field label', async function (assert) {
    this.setProperties({
      label: 'Test label',
      placeholder: 'testing',
    });

    await render(
      hbs`<AkTextField @label={{this.label}} @placeholder={{this.placeholder}} />`
    );

    assert.dom('[data-test-form-label]').exists().hasText(this.label);

    this.set('label', undefined);

    assert.dom('[data-test-form-label]').doesNotExist();
  });

  test('test text field helper text & error state', async function (assert) {
    this.setProperties({
      placeholder: 'testing',
      error: false,
    });

    await render(
      hbs`<AkTextField @placeholder={{this.placeholder}} @helperText={{this.helperText}} @error={{this.error}} />`
    );

    assert.dom('[data-test-helper-text]').doesNotExist();

    this.set('helperText', 'test helper text');

    assert
      .dom('[data-test-helper-text]')
      .exists()
      .hasText(this.helperText)
      .hasNoClass(/ak-error-form-helper-text/i);

    this.set('error', true);

    assert
      .dom('[data-test-text-input-outlined]')
      .hasClass(/ak-error-text-input/i);

    assert
      .dom('[data-test-helper-text]')
      .hasClass(/ak-error-form-helper-text/i);
  });

  test('test left and right adornment', async function (assert) {
    this.setProperties({
      placeholder: 'testing',
    });

    await render(
      hbs`
        <AkTextField @placeholder={{this.placeholder}}>
          <:leftAdornment><span>left</span></:leftAdornment>
          <:rightAdornment><span>right</span></:rightAdornment>
        </AkTextField>
      `
    );

    assert
      .dom('[data-test-ak-text-field-left-adornment]')
      .exists()
      .hasText('left');

    assert
      .dom('[data-test-ak-text-field-right-adornment]')
      .exists()
      .hasText('right');
  });

  test('test text field events', async function (assert) {
    let changeEventTriggered = false;
    let blurEventTriggered = false;
    let keyUpEventTriggered = false;

    this.setProperties({
      onChange() {
        changeEventTriggered = true;
      },
      onBlur() {
        blurEventTriggered = true;
      },
      onKeyUp() {
        keyUpEventTriggered = true;
      },
    });

    await render(
      hbs`
        <AkTextField
         @placeholder={{this.placeholder}}
         {{on 'change' this.onChange}}
         {{on 'blur' this.onBlur}}
         {{on 'keyup' this.onKeyUp}} />
      `
    );

    const input = this.element.querySelector('[data-test-text-input]');

    await triggerEvent(input, 'change');
    assert.true(changeEventTriggered);

    await triggerEvent(input, 'blur');
    assert.true(blurEventTriggered);

    await triggerEvent(input, 'keyup');
    assert.true(keyUpEventTriggered);
  });
});
