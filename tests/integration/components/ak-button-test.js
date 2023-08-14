import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-button', function (hooks) {
  setupRenderingTest(hooks);

  test.each(
    'it renders ak-button in all variants',
    [{ variant: 'filled' }, { variant: 'outlined' }, { variant: 'text' }],
    async function (assert, { variant }) {
      this.setProperties({ variant });

      await render(hbs`<AkButton @variant={{this.variant}}>Button</AkButton>`);

      assert
        .dom('[data-test-ak-button]')
        .exists()
        .isNotDisabled()
        .hasText('Button');
    }
  );

  test.each(
    'it renders ak-button with different tags',
    ['', 'button', 'a', 'div', 'label', 'span'],
    async function (assert, tag) {
      this.setProperties({ tag });

      await render(hbs`<AkButton @tag={{this.tag}}>Button</AkButton>`);

      assert
        .dom('[data-test-ak-button]')
        .exists()
        .hasTagName(this.tag || 'button')
        .hasText('Button');

      if ((this.tag || 'button') === 'button') {
        assert.dom('[data-test-ak-button]').hasAttribute('type', 'button');
        assert.dom('[data-test-ak-button]').hasNoAttribute('role');
      } else {
        assert.dom('[data-test-ak-button]').hasNoAttribute('type');
        assert.dom('[data-test-ak-button]').hasAttribute('role', 'button');
      }
    }
  );

  test.each(
    'it render button with disabled state',
    ['', 'button', 'a', 'div', 'label', 'span'],
    async function (assert, tag) {
      this.setProperties({ tag, disabled: true });

      await render(
        hbs`<AkButton @tag={{this.tag}} @disabled={{this.disabled}}>Button</AkButton>`
      );

      if ((this.tag || 'button') === 'button') {
        assert
          .dom('[data-test-ak-button]')
          .isDisabled()
          .hasClass(/ak-button-disabled/)
          .hasText('Button');
      } else {
        assert
          .dom('[data-test-ak-button]')
          .hasClass(/ak-button-disabled/)
          .hasNoAttribute('disabled')
          .hasText('Button');
      }
    }
  );

  test('it render button with different types', async function (assert) {
    this.set('type', 'button');

    await render(hbs`<AkButton @type={{this.type}}>Button</AkButton>`);

    assert
      .dom('[data-test-ak-button]')
      .exists()
      .hasText('Button')
      .hasProperty('type', 'button');

    this.set('type', 'submit');

    assert.dom('[data-test-ak-button]').hasProperty('type', 'submit');
  });

  test('it handle click event from btn', async function (assert) {
    assert.expect(1);

    this.set('onClick', () => {
      assert.ok(true, 'click event handled');
    });

    await render(hbs`<AkButton {{on 'click' this.onClick}}>Button</AkButton>`);

    await click('[data-test-ak-button]');
  });

  test.each(
    'test button variant & color combo',
    [
      ['', '', /ak-button-filled-primary/i],
      ['filled', 'primary', /ak-button-filled-primary/i],
      ['outlined', 'primary', /ak-button-outlined-primary/i],
      ['outlined', 'neutral', /ak-button-outlined-neutral/i],
    ],
    async function (assert, [variant, color, className]) {
      this.setProperties({
        color,
        variant,
      });

      await render(
        hbs`<AkButton @color={{this.color}} @variant={{this.variant}}>Button</AkButton>`
      );

      assert.dom('[data-test-ak-button]').exists().hasClass(className);
    }
  );

  // note: colors in text variant co-relate with typography colors
  test('test text variant button for color', async function (assert) {
    this.set('color', 'textPrimary');

    await render(
      hbs`<AkButton @variant="text" @color={{this.color}}>Button</AkButton>`
    );

    const button = find('[data-test-ak-button]');

    assert
      .dom(button)
      .hasClass(/ak-button-text-root/i)
      .hasNoClass(/ak-button-root/i);

    assert
      .dom('[data-test-ak-button-text]', button)
      .exists()
      .hasText('Button')
      .hasClass(/ak-typography-color-textPrimary/i);

    this.set('color', 'warn');

    assert
      .dom('[data-test-ak-button-text]', button)
      .exists()
      .hasClass(/ak-typography-color-warn/i);
  });

  // note: font weight in text variant co-relate with typography font weight
  test('test text variant button for font-weight', async function (assert) {
    this.set('typographyFontWeight', 'medium');

    await render(
      hbs`<AkButton @variant="text" @typographyFontWeight={{this.typographyFontWeight}} >Button</AkButton>`
    );

    const button = find('[data-test-ak-button]');

    assert
      .dom(button)
      .hasClass(/ak-button-text-root/i)
      .hasNoClass(/ak-button-root/i);

    assert
      .dom('[data-test-ak-button-text]', button)
      .exists()
      .hasText('Button')
      .hasClass(/ak-typography-font-weight-medium/i);

    this.set('typographyFontWeight', 'bold');

    assert
      .dom('[data-test-ak-button-text]', button)
      .exists()
      .hasClass(/ak-typography-font-weight-bold/i);
  });

  test('test text variant button for underline', async function (assert) {
    this.set('underline', 'none');
    await render(
      hbs`<AkButton @variant="text" @underline={{this.underline}}>Button</AkButton>`
    );

    const button = find('[data-test-ak-button]');

    assert
      .dom(button)
      .hasClass(/ak-button-text-root/i)
      .hasClass(/ak-button-text-underline-none/i)
      .hasNoClass(/ak-button-root/i);

    assert
      .dom('[data-test-ak-button-text]', button)
      .exists()
      .hasText('Button')
      .hasClass(/ak-typography-underline-none/i);

    this.set('underline', 'always');

    assert.dom(button).hasNoClass(/ak-button-text-underline-none/i);

    assert
      .dom('[data-test-ak-button-text]', button)
      .exists()
      .hasClass(/ak-typography-underline-always/i);
  });

  test('it render button with left and right icon', async function (assert) {
    await render(hbs`
      <AkButton>
        <:leftIcon>leftIcon</:leftIcon>

        <:default>Button</:default>

        <:rightIcon>rightIcon</:rightIcon>
      </AkButton>
    `);

    const button = find('[data-test-ak-button]');

    assert
      .dom(button)
      .exists()
      .hasText(/Button/i);

    assert
      .dom('[data-test-ak-button-left-icon]', button)
      .exists()
      .hasText('leftIcon');

    assert
      .dom('[data-test-ak-button-right-icon]', button)
      .exists()
      .hasText('rightIcon');
  });

  test('it render button in loading state', async function (assert) {
    this.set('loading', true);

    await render(hbs`
      <AkButton @loading={{this.loading}}>Button</AkButton>
    `);

    assert.dom('[data-test-ak-button]').exists().isDisabled().hasText('Button');

    assert.dom('[data-test-ak-button-loader]').exists();

    this.set('loading', false);

    assert.dom('[data-test-ak-button]').isNotDisabled();

    assert.dom('[data-test-ak-button-loader]').doesNotExist();
  });

  test('it render button in loading state with left and right icon', async function (assert) {
    this.set('loading', true);

    await render(hbs`
      <AkButton @loading={{this.loading}}>
        <:leftIcon>leftIcon</:leftIcon>

        <:default>Button</:default>

        <:rightIcon>rightIcon</:rightIcon>
      </AkButton>
    `);

    const button = find('[data-test-ak-button]');

    assert
      .dom(button)
      .exists()
      .isDisabled()
      .hasText(/Button/i);

    assert.dom('[data-test-ak-button-left-icon]', button).doesNotExist();
    assert.dom('[data-test-ak-button-right-icon]', button).doesNotExist();

    this.set('loading', false);

    assert.dom(button).isNotDisabled();

    assert
      .dom('[data-test-ak-button-left-icon]', button)
      .exists()
      .hasText('leftIcon');

    assert
      .dom('[data-test-ak-button-right-icon]', button)
      .exists()
      .hasText('rightIcon');
  });

  test('it renders button icons with the correct custom className', async function (assert) {
    this.setProperties({
      leftIconClass: 'leftIconClassName',
      rightIconClass: 'rightIconClassName',
    });

    await render(hbs`
      <AkButton @leftIconClass={{this.leftIconClass}} @loading={{this.loading}}>
        <:leftIcon>leftIcon</:leftIcon>
        <:default>Button</:default>
      </AkButton>
    `);

    assert.dom('[data-test-ak-button-left-icon]').hasClass(this.leftIconClass);

    await render(hbs`
      <AkButton @rightIconClass={{this.rightIconClass}} @loading={{this.loading}}>
        <:rightIcon>rightIcon</:rightIcon>
        <:default>Button</:default>
      </AkButton>
  `);

    assert
      .dom('[data-test-ak-button-right-icon]')
      .hasClass(this.rightIconClass);
  });
});
