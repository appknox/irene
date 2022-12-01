import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-list', async function (assert) {
    await render(hbs`
        <AkList as |akl|>
            <akl.listItem>
              list item
            </akl.listItem>
        </AkList>
    `);

    assert.dom('[data-test-ak-list]').exists().hasText('list item');
  });

  test('it renders ak-list with icon & text', async function (assert) {
    await render(hbs`
        <AkList as |akl|>
            <akl.listItem as |li|>
              <li.leftIcon>
                <AkIcon @iconName="done" />
              </li.leftIcon>

              <li.text @primaryText="list item" />
            </akl.listItem>
        </AkList>
    `);

    assert.dom('[data-test-list-item-text]').exists();
    assert.dom('[data-test-ak-list]').exists().hasText('list item');
    assert.dom('[data-test-list-item-icon]').exists();
  });

  test('it renders ak-list with text primary & secondary', async function (assert) {
    await render(hbs`
        <AkList as |akl|>
            <akl.listItem as |li|>
              <li.text @primaryText="list item" @secondaryText={{this.secondaryText}} />
            </akl.listItem>
        </AkList>
    `);

    assert.dom('[data-test-ak-list]').exists();

    assert
      .dom('[data-test-list-item-text-primary]')
      .exists()
      .hasText('list item');

    assert.dom('[data-test-list-item-text-secondary]').doesNotExist();

    this.set('secondaryText', 'secondary text');

    assert
      .dom('[data-test-list-item-text-primary]')
      .exists()
      .hasText('list item');

    assert
      .dom('[data-test-list-item-text-secondary]')
      .exists()
      .hasText(this.secondaryText);
  });

  test.each(
    'it renders ak-list with different list items',
    [
      [{ button: true }, '[data-test-ak-list-item-button]'],
      [{ link: true }, '[data-test-ak-list-item-link]'],
      [{}, '[data-test-ak-list-item]'],
    ],
    async function (assert, [props, selector]) {
      this.setProperties({
        ...props,
      });

      await render(hbs`
        <AkList as |akl|>
            <akl.listItem @button={{this.button}} @link={{this.link}} as |li|>
              <li.leftIcon>
                <AkIcon @iconName="done" />
              </li.leftIcon>

              <li.text @primaryText="list item" />
            </akl.listItem>
        </AkList>
    `);

      assert.dom('[data-test-ak-list]').exists();
      assert.dom(selector).exists();
      assert.dom('[data-test-list-item-text]').exists().hasText('list item');
      assert.dom('[data-test-list-item-icon]').exists();
    }
  );
});
