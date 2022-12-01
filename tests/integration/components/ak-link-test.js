import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-link', async function (assert) {
    await render(hbs`<AkLink>Link</AkLink>`);

    assert
      .dom('[data-test-ak-link]')
      .exists()
      .doesNotHaveClass(/ak-link-disabled/i)
      .hasText('Link');
  });

  test('it render link with disabled state', async function (assert) {
    this.set('disabled', true);

    await render(hbs`<AkLink @disabled={{this.disabled}}>Link</AkLink>`);

    assert
      .dom('[data-test-ak-link]')
      .exists()
      .hasText('Link')
      .hasClass(/ak-link-disabled/i);

    assert
      .dom('[data-test-ak-link-text]')
      .hasClass(/ak-typography-color-inherit/i);
  });

  test.each(
    'it renders ak-link with different colors',
    [
      '',
      'textPrimary',
      'textSecondary',
      'primary',
      'secondary',
      'success',
      'error',
      'warn',
      'info',
    ],
    async function (assert, color) {
      this.setProperties({
        color,
      });

      await render(hbs`<AkLink @color={{this.color}}>Link</AkLink>`);

      assert
        .dom('[data-test-ak-link]')
        .exists()
        .hasText('Link')
        .hasClass(
          new RegExp(`ak-link-color-${this.color || 'textPrimary'}`, 'i')
        );

      assert
        .dom('[data-test-ak-link-text]')
        .hasClass(
          new RegExp(`ak-typography-color-${this.color || 'textPrimary'}`, 'i')
        );
    }
  );

  test.each(
    'it renders ak-link with different underline states',
    ['', 'none', 'always', 'hover'],
    async function (assert, underline) {
      this.setProperties({
        underline,
      });

      await render(hbs`<AkLink @underline={{this.underline}}>Link</AkLink>`);

      assert
        .dom('[data-test-ak-link]')
        .exists()
        .hasText('Link')
        .hasClass(
          new RegExp(`ak-link-underline-${this.underline || 'hover'}`, 'i')
        );
    }
  );

  test('it render link with left and right icon', async function (assert) {
    await render(hbs`
      <AkLink>
        <:leftIcon>leftIcon</:leftIcon>

        <:default>Link</:default>

        <:rightIcon>rightIcon</:rightIcon>
      </AkLink>
    `);

    const link = find('[data-test-ak-link]');

    assert.dom(link).exists().hasText(/Link/i);

    assert
      .dom('[data-test-ak-link-left-icon]', link)
      .exists()
      .hasText('leftIcon');

    assert
      .dom('[data-test-ak-link-right-icon]', link)
      .exists()
      .hasText('rightIcon');
  });
});
