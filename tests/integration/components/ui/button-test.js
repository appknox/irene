import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import index from 'irene/components/ui/button/index.scss';

module('Integration | Component | ui/button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders btn text without disabled state', async function (assert) {
    this.set('text', 'test btn');
    this.set('onClick', () => {});
    await render(
      hbs`<Ui::Button @text={{this.text}} @onClick={{this.onClick}}/>`
    );

    assert.dom(`[data-test-ui-btn]`).hasText(this.text);
    assert.dom(`[data-test-ui-btn]`).doesNotHaveAttribute('disabled');
    assert.dom(`[data-test-btn-icon]`).doesNotExist();
  });

  test('it renders btn text with icon', async function (assert) {
    this.set('text', 'test btn');
    this.set('icon', 'tick');
    this.set('onClick', () => {});
    await render(
      hbs`<Ui::Button @text={{this.text}} @onClick={{this.onClick}} @icon={{this.icon}}/>`
    );

    assert.dom(`[data-test-ui-btn]`).containsText(this.text);
    assert.dom(`[data-test-btn-icon]`).hasText(this.icon);
  });

  test('it renders btn with given class', async function (assert) {
    this.set('text', 'test btn');
    this.set('onClick', () => {});
    this.set('class', 'primary');
    await render(
      hbs`<Ui::Button @text={{this.text}} @onClick={{this.onClick}} @class={{this.class}}/>`
    );

    assert.dom(`[data-test-ui-btn]`).hasClass(index['primary']);

    this.set('class', 'secondary');
    assert.dom(`[data-test-ui-btn]`).hasClass(index['secondary']);
  });

  test('it handle click event from btn', async function (assert) {
    this.set('text', 'test btn');
    this.set('onClick', () => {
      assert.ok(true, 'click event handled');
    });
    await render(
      hbs`<Ui::Button @text={{this.text}} @onClick={{this.onClick}} />`
    );

    await click(`[data-test-ui-btn]`);
  });

  test('it render button with disabled state', async function (assert) {
    this.set('text', 'test btn');
    this.set('onClick', () => {});
    this.set('isDisabled', true);
    await render(
      hbs`<Ui::Button @isDisabled={{this.isDisabled}} @text={{this.text}} @onClick={{this.onClick}} />`
    );

    assert.dom(`[data-test-ui-btn]`).hasAttribute('disabled');
  });
});
