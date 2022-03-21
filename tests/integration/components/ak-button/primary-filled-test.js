/* eslint-disable qunit/require-expect */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-button/primary-filled', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders btn with default state', async function (assert) {
    this.set('onClick', () => {});
    await render(hbs`<AkButton::PrimaryFilled @onClick={{this.onClick}}/>`);

    assert
      .dom(`[data-test-btn-primary-filled]`)
      .doesNotHaveAttribute('disabled');
  });

  test('it render button with disabled state', async function (assert) {
    this.set('onClick', () => {});
    this.set('isDisabled', true);
    await render(
      hbs`<AkButton::PrimaryFilled @isDisabled={{this.isDisabled}}  @onClick={{this.onClick}} />`
    );
    assert.dom(`[data-test-btn-primary-filled]`).hasAttribute('disabled');
  });

  test('it handle click event from btn', async function (assert) {
    this.set('onClick', () => {
      assert.ok(true, 'click event handled');
    });
    await render(hbs`<AkButton::PrimaryFilled @onClick={{this.onClick}} />`);

    await click(`[data-test-btn-primary-filled]`);
  });

  test('it renders btn with text', async function (assert) {
    this.set('onClick', () => {});
    await render(
      hbs`<AkButton::PrimaryFilled @onClick={{this.onClick}}>
      <span>Test Button</span>
      </AkButton::PrimaryFilled>`
    );

    assert.dom(`[data-test-btn-primary-filled]`).containsText('Test Button');
  });
});
