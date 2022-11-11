import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-radio', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-radio with radio group', async function (assert) {
    this.setProperties({
      firstRadio: 'First radio',
      secondRadio: 'Second radio',
    });

    await render(hbs`
        <AkRadio::Group>
            <AkFormControlLabel @label={{this.firstRadio}} as |fcl|>
                <AkRadio @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
            <AkFormControlLabel @label={{this.secondRadio}} as |fcl|>
                <AkRadio @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
        </AkRadio::Group>
    `);

    const formControlLabels = findAll('[data-test-ak-form-label]');

    assert.strictEqual(formControlLabels.length, 2);

    assert.dom('[data-test-ak-radio-group]').exists();
    assert.dom('[data-test-radio]').exists().isNotDisabled();
  });

  test('test ak-radio with disabled state', async function (assert) {
    this.setProperties({
      firstRadio: 'First radio',
      secondRadio: 'Second radio',
      firstOnChangeCalled: false,
      secondOnChangeCalled: false,
      firstOnChange: () => {
        this.set('firstOnChangeCalled', true);
      },
      secondOnChange: () => {
        this.set('secondOnChangeCalled', true);
      },
    });

    await render(hbs`
        <AkRadio::Group as |ctx|>
            <AkFormControlLabel @label={{this.firstRadio}} as |fcl|>
                <AkRadio @radioCtx={{ctx}}  @onChange={{this.firstOnChange}} @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
            <AkFormControlLabel @disabled={{true}} @label={{this.secondRadio}} as |fcl|>
                <AkRadio @radioCtx={{ctx}} @onChange={{this.secondOnChange}} @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
        </AkRadio::Group>
    `);

    const formControlLabels = findAll('[data-test-ak-form-label]');
    const radios = findAll('[data-test-radio]');

    assert.dom(radios[0]).exists().isNotChecked().isNotDisabled();
    assert.dom(radios[1]).exists().isNotChecked().isDisabled();
    assert
      .dom(formControlLabels[1])
      .hasClass(/ak-form-control-label-disabled/i);

    await click(formControlLabels[0]);

    assert.dom(radios[0]).isChecked();
    assert.true(this.firstOnChangeCalled);

    await click(formControlLabels[1]);

    assert.dom(radios[1]).isNotChecked().isDisabled();
    assert.false(this.secondOnChangeCalled);
  });

  test('test ak-radio state change controlled with onchange handler', async function (assert) {
    this.setProperties({
      firstRadio: 'First radio',
      secondRadio: 'Second radio',
      value: 'First radio',
      firstOnChangeHandler: (event) => {
        this.set('value', event.target.value);
      },
      secondOnChangeHandler: (event) => {
        this.set('value', event.target.value);
      },
    });

    await render(hbs`
        <AkRadio::Group @value={{this.value}} as |ctx|>
            <AkFormControlLabel @label={{this.firstRadio}} as |fcl|>
                <AkRadio @radioCtx={{ctx}} @value={{this.firstRadio}} @onChange={{this.firstOnChangeHandler}} @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
            <AkFormControlLabel @label={{this.secondRadio}} as |fcl|>
                <AkRadio @radioCtx={{ctx}} @value={{this.secondRadio}} @onChange={{this.secondOnChangeHandler}} @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
        </AkRadio::Group>
    `);

    const formControlLabels = findAll('[data-test-ak-form-label]');
    const radios = findAll('[data-test-radio]');

    assert.dom(radios[0]).isChecked();
    assert
      .dom(radios[0].nextElementSibling)
      .matchesSelector('[data-test-radio-checked]');

    assert.strictEqual(this.value, this.firstRadio);

    await click(formControlLabels[1]);

    assert.dom(radios[0]).isNotChecked();
    assert
      .dom(radios[0].nextElementSibling)
      .matchesSelector('[data-test-radio-unchecked]');

    assert.dom(radios[1]).isChecked();
    assert
      .dom(radios[1].nextElementSibling)
      .matchesSelector('[data-test-radio-checked]');

    assert.strictEqual(this.value, this.secondRadio);

    await click(formControlLabels[0]);

    assert.dom(radios[0]).isChecked();

    assert.dom(radios[1]).isNotChecked();
    assert
      .dom(radios[0].nextElementSibling)
      .matchesSelector('[data-test-radio-checked]');

    assert
      .dom(radios[1].nextElementSibling)
      .matchesSelector('[data-test-radio-unchecked]');

    assert.strictEqual(this.value, this.firstRadio);
  });

  test('test ak-radio for falsey value', async function (assert) {
    this.setProperties({
      firstRadio: 'First radio',
      secondRadio: 'Second radio',
      value: 0,
      firstOnChangeHandler: (event) => {
        // dom will convert it to string
        this.set('value', parseInt(event.target.value));
      },
      secondOnChangeHandler: (event) => {
        // dom will convert it to string
        this.set('value', parseInt(event.target.value));
      },
    });

    await render(hbs`
        <AkRadio::Group @value={{this.value}} as |ctx|>
            <AkFormControlLabel @label={{this.firstRadio}} as |fcl|>
                <AkRadio @radioCtx={{ctx}} @value={{0}} @onChange={{this.firstOnChangeHandler}} @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
            <AkFormControlLabel @label={{this.secondRadio}} as |fcl|>
                <AkRadio @radioCtx={{ctx}} @value={{1}} @onChange={{this.secondOnChangeHandler}} @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
        </AkRadio::Group>
    `);

    const formControlLabels = findAll('[data-test-ak-form-label]');
    const radios = findAll('[data-test-radio]');

    assert.dom(radios[0]).isChecked();
    assert
      .dom(radios[0].nextElementSibling)
      .matchesSelector('[data-test-radio-checked]');

    assert.strictEqual(this.value, 0);

    await click(formControlLabels[1]);

    assert.dom(radios[0]).isNotChecked();
    assert
      .dom(radios[0].nextElementSibling)
      .matchesSelector('[data-test-radio-unchecked]');

    assert.dom(radios[1]).isChecked();
    assert
      .dom(radios[1].nextElementSibling)
      .matchesSelector('[data-test-radio-checked]');

    assert.strictEqual(this.value, 1);

    await click(formControlLabels[0]);

    assert.dom(radios[0]).isChecked();

    assert.dom(radios[1]).isNotChecked();
    assert
      .dom(radios[0].nextElementSibling)
      .matchesSelector('[data-test-radio-checked]');

    assert
      .dom(radios[1].nextElementSibling)
      .matchesSelector('[data-test-radio-unchecked]');

    assert.strictEqual(this.value, 0);
  });

  test('test ak-radio state change standlone controlled', async function (assert) {
    this.setProperties({
      firstRadio: 'First radio',
      secondRadio: 'Second radio',
      value: 'First radio',
      firstOnChangeHandler: (event) => {
        this.set('value', event.target.value);
      },
      secondOnChangeHandler: (event) => {
        this.set('value', event.target.value);
      },
    });

    await render(hbs`
        <div>
            <AkFormControlLabel @label={{this.firstRadio}} as |fcl|>
                <AkRadio @value={{this.firstRadio}} @checked={{eq this.value this.firstRadio}} @name="standloneRadios" @onChange={{this.firstOnChangeHandler}} @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
            <AkFormControlLabel @label={{this.secondRadio}} as |fcl|>
                <AkRadio @value={{this.secondRadio}} @checked={{eq this.value this.secondRadio}} @name="standloneRadios" @onChange={{this.secondOnChangeHandler}} @disabled={{fcl.disabled}} />
            </AkFormControlLabel>
        </div>
    `);

    const formControlLabels = findAll('[data-test-ak-form-label]');
    const radios = findAll('[data-test-radio]');

    assert.dom(radios[0]).isChecked();
    assert
      .dom(radios[0].nextElementSibling)
      .matchesSelector('[data-test-radio-checked]');

    assert.strictEqual(this.value, this.firstRadio);

    await click(formControlLabels[1]);

    assert.dom(radios[0]).isNotChecked();
    assert
      .dom(radios[0].nextElementSibling)
      .matchesSelector('[data-test-radio-unchecked]');

    assert.dom(radios[1]).isChecked();
    assert
      .dom(radios[1].nextElementSibling)
      .matchesSelector('[data-test-radio-checked]');

    assert.strictEqual(this.value, this.secondRadio);

    await click(formControlLabels[0]);

    assert.dom(radios[0]).isChecked();
    assert
      .dom(radios[0].nextElementSibling)
      .matchesSelector('[data-test-radio-checked]');

    assert.dom(radios[1]).isNotChecked();
    assert
      .dom(radios[1].nextElementSibling)
      .matchesSelector('[data-test-radio-unchecked]');

    assert.strictEqual(this.value, this.firstRadio);
  });
});
