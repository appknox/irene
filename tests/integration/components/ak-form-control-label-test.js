import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-form-control-label', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-form-control-label', async function (assert) {
    this.setProperties({
      label: 'test label',
    });

    await render(hbs`
        <AkFormControlLabel @label={{this.label}} as |fcl|>
            <input data-test-checkbox type="checkbox" id="check-1" disabled={{fcl.disabled}} />
        </AkFormControlLabel>
    `);

    assert.dom('[data-test-ak-form-label]').exists().hasText(this.label);
    assert.dom('[data-test-checkbox]').exists().isNotDisabled();
  });

  test('it renders ak-form-control-label without label', async function (assert) {
    await render(hbs`
        <AkFormControlLabel as |fcl|>
            <input data-test-checkbox type="checkbox" id="check-1" disabled={{fcl.disabled}} />
        </AkFormControlLabel>
    `);

    assert.dom('[data-test-ak-form-label]').doesNotExist();
    assert.dom('[data-test-checkbox]').exists().isNotDisabled();
  });

  test('it renders ak-form-control-label disabled', async function (assert) {
    this.setProperties({
      label: 'test label',
      disabled: true,
    });

    await render(hbs`
        <AkFormControlLabel @disabled={{this.disabled}} @label={{this.label}} as |fcl|>
            <input data-test-checkbox type="checkbox" id="check-1" disabled={{fcl.disabled}} />
        </AkFormControlLabel>
    `);

    assert
      .dom('[data-test-ak-form-label]')
      .exists()
      .hasClass(/ak-form-control-label-disabled/i);

    assert.dom('[data-test-checkbox]').exists().isDisabled();
  });

  test('test ak-form-control-label label placement', async function (assert) {
    this.setProperties({
      label: 'test label',
    });

    await render(hbs`
        <AkFormControlLabel @placement={{this.placement}} @label={{this.label}} as |fcl|>
            <input data-test-checkbox type="checkbox" id="check-1" disabled={{fcl.disabled}} />
        </AkFormControlLabel>
    `);

    assert
      .dom('[data-test-ak-form-label-root]')
      .exists()
      .hasClass(/ak-form-control-label-placement-right/i);

    this.set('placement', 'left');

    assert
      .dom('[data-test-ak-form-label-root]')
      .exists()
      .hasClass(/ak-form-control-label-placement-left/i);

    this.set('placement', 'right');

    assert
      .dom('[data-test-ak-form-label-root]')
      .exists()
      .hasClass(/ak-form-control-label-placement-right/i);
  });

  test('test label click of ak-form-control-label', async function (assert) {
    this.setProperties({
      label: 'test label',
    });

    await render(hbs`
        <AkFormControlLabel @label={{this.label}} as |fcl|>
            <input data-test-checkbox type="checkbox" id="check-1" disabled={{fcl.disabled}} />
        </AkFormControlLabel>
    `);

    assert.dom('[data-test-checkbox]').exists().isNotChecked().isNotDisabled();

    await click('[data-test-ak-form-label-root]');

    assert.dom('[data-test-checkbox]').isChecked();

    await click('[data-test-ak-form-label-root]');

    assert.dom('[data-test-checkbox]').isNotChecked();
  });
});
