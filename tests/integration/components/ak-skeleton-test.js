import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-skeleton', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-skeleton', async function (assert) {
    await render(hbs`<AkSkeleton />`);

    assert
      .dom('[data-test-ak-skeleton]')
      .exists()
      .hasClass(/ak-skeleton-variant-rounded/)
      .hasTagName('span');
  });

  test.each(
    'it renders ak-skeleton in different variants',
    ['', 'circular', 'rectangular', 'rounded'],
    async function (assert, variant) {
      this.setProperties({
        variant,
      });

      await render(hbs`<AkSkeleton @variant={{this.variant}} />`);

      assert
        .dom('[data-test-ak-skeleton]')
        .hasClass(new RegExp(`ak-skeleton-variant-${variant || 'rounded'}`))
        .hasTagName('span');
    }
  );

  test('it renders ak-skeleton in passed tag argument', async function (assert) {
    this.set('tag', 'div');

    await render(hbs`<AkSkeleton @tag={{this.tag}} />`);

    assert
      .dom('[data-test-ak-skeleton]')
      .exists()
      .hasClass(/ak-skeleton-variant-rounded/)
      .hasTagName(this.tag);
  });

  test('it renders ak-skeleton with passed width & height', async function (assert) {
    this.setProperties({
      width: '250px',
      height: '20px',
    });

    await render(
      hbs`<AkSkeleton @width={{this.width}} @height={{this.height}} />`
    );

    assert
      .dom('[data-test-ak-skeleton]')
      .exists()
      .hasClass(/ak-skeleton-variant-rounded/)
      .hasStyle({ width: this.width, height: this.height })
      .hasTagName('span');
  });
});
