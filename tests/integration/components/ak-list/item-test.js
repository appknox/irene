import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-list/item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-list/item', async function (assert) {
    await render(hbs`
        <AkList::Item>
            list item
        </AkList::Item>
    `);

    assert.dom('[data-test-ak-list-item]').exists().hasText('list item');
    assert.dom('[data-test-ak-list-item-divider]').doesNotExist();
  });

  test('it renders ak-list/item button', async function (assert) {
    await render(hbs`
        <AkList::Item @button={{true}}>
            list item
        </AkList::Item>
    `);

    assert.dom('[data-test-ak-list-item-button]').exists().hasText('list item');
  });

  test('test ak-list/item button onClick', async function (assert) {
    let event = null;

    this.set('onClick', (e) => {
      event = e;
    });

    await render(hbs`
        <AkList::Item @onClick={{this.onClick}} @button={{true}}>
            list item
        </AkList::Item>
    `);

    assert.dom('[data-test-ak-list-item-button]').exists().hasText('list item');
    assert.notOk(event);

    const button = find('[data-test-ak-list-item-button]').firstElementChild;

    await click(button);

    assert.ok(event);
    assert.strictEqual(event.type, 'click');
  });

  test('it renders ak-list/item button disabled', async function (assert) {
    this.set('disabled', false);

    await render(hbs`
        <AkList::Item @disabled={{this.disabled}} @button={{true}}>
            list item
        </AkList::Item>
    `);

    const button = find('[data-test-ak-list-item-button]').firstElementChild;

    assert.dom(button).exists().isNotDisabled().hasText('list item');

    this.set('disabled', true);

    assert.dom(button).isDisabled();
  });

  test('it renders ak-list/item link', async function (assert) {
    await render(hbs`
        <AkList::Item @link={{true}}>
            list item
        </AkList::Item>
    `);

    assert.dom('[data-test-ak-list-item-link]').exists().hasText('list item');
  });

  test('it renders ak-list/item link disabled', async function (assert) {
    this.set('disabled', false);

    await render(hbs`
        <AkList::Item @disabled={{this.disabled}} @link={{true}}>
            list item
        </AkList::Item>
    `);

    const link = find('[data-test-ak-list-item-link]').firstElementChild;

    assert
      .dom(link)
      .exists()
      .doesNotHaveClass(/ak-list-item-link-disabled/i)
      .hasText('list item');

    this.set('disabled', true);

    assert.dom(link).hasClass(/ak-list-item-link-disabled/i);
  });

  test('it renders ak-list/item with divider', async function (assert) {
    await render(hbs`
        <AkList::Item @divider={{true}}>
            list item
        </AkList::Item>
    `);

    assert.dom('[data-test-ak-list-item]').exists().hasText('list item');
    assert.dom('[data-test-ak-list-item-divider]').exists();
  });

  test.each(
    'it renders ak-list/item selected',
    [
      [{ button: true }, '[data-test-ak-list-item-button]'],
      [{ link: true }, '[data-test-ak-list-item-link]'],
      [{}, '[data-test-ak-list-item]'],
    ],
    async function (assert, [props, selector]) {
      this.setProperties({
        ...props,
        selected: false,
      });

      await render(hbs`
        <AkList::Item @button={{this.button}} @link={{this.link}} @selected={{this.selected}}>
            list item
        </AkList::Item>
    `);

      assert
        .dom(selector)
        .exists()
        .hasText('list item')
        .doesNotHaveClass(/ak-list-item-selected/i);

      this.set('selected', true);

      assert.dom(selector).hasClass(/ak-list-item-selected/i);
    }
  );

  test.each(
    'it renders ak-list/item with item icon & text',
    [
      [{ button: true }, '[data-test-ak-list-item-button]'],
      [{ link: true }, '[data-test-ak-list-item-link]'],
      [{}, '[data-test-ak-list-item]'],
    ],
    async function (assert, [props, selector]) {
      this.setProperties({
        ...props,
        disabled: false,
      });

      await render(hbs`
        <AkList::Item @disabled={{this.disabled}} @button={{this.button}} @link={{this.link}} as |li|>
            <li.leftIcon data-test-left-icon>$</li.leftIcon>

            <li.text @primaryText="list item" />

            <li.rightIcon data-test-right-icon>#</li.rightIcon>
        </AkList::Item>
    `);

      assert.dom(selector).exists();

      assert
        .dom('[data-test-left-icon]')
        .exists()
        .hasClass(/ak-list-item-icon-gutter-right/i)
        .doesNotHaveClass(/ak-list-item-icon-disabled/i);

      assert
        .dom('[data-test-right-icon]')
        .exists()
        .hasClass(/ak-list-item-icon-gutter-left/i)
        .doesNotHaveClass(/ak-list-item-icon-disabled/i);

      assert
        .dom('[data-test-list-item-text]')
        .exists()
        .hasText('list item')
        .doesNotHaveClass(/ak-list-item-text-disabled/i);

      this.set('disabled', true);

      assert
        .dom('[data-test-left-icon]')
        .hasClass(/ak-list-item-icon-disabled/i);

      assert
        .dom('[data-test-right-icon]')
        .hasClass(/ak-list-item-icon-disabled/i);

      assert
        .dom('[data-test-list-item-text]')
        .hasClass(/ak-list-item-text-disabled/i);
    }
  );
});
