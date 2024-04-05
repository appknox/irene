import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-logo', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders app-logo', async function (assert) {
    await render(hbs`<AppLogo />`);

    assert.dom('[data-test-app-logo-container]').exists();
    assert.dom('[data-test-appLogo-img]').exists();
  });

  test.each(
    'it renders app-logo with different size',
    [
      { size: 'small', class: /app-logo-container-size-small/i },
      { size: 'medium', class: /app-logo-container-size-medium/i },
      { size: 'large', class: /app-logo-container-size-large/i },
    ],
    async function (assert, data) {
      this.setProperties({
        size: data.size,
      });

      await render(hbs`<AppLogo @size={{this.size}} />`);

      assert
        .dom('[data-test-app-logo-container]')
        .exists()
        .hasClass(data.class);
    }
  );

  test('it renders app-logo with padding', async function (assert) {
    await render(hbs`<AppLogo />`);

    assert
      .dom('[data-test-app-logo-container]')
      .exists()
      .hasClass(/app-logo-container-padding/i);

    await render(hbs`<AppLogo @padding={{false}}/>`);

    assert
      .dom('[data-test-app-logo-container]')
      .exists()
      .hasNoClass(/app-logo-container-padding/i);
  });

  test('it renders app-logo correctly with skeleton', async function (assert) {
    await render(hbs`<AppLogo />`);

    assert.dom('[data-test-appLogo-img]').exists();
    assert.dom('[data-test-app-logo-skeleton]').doesNotExist();

    await render(hbs`<AppLogo @loading={{true}}/>`);

    assert.dom('[data-test-appLogo-img]').doesNotExist();
    assert.dom('[data-test-app-logo-skeleton]').exists();
  });

  test('it renders app-logo with image rounded', async function (assert) {
    await render(hbs`<AppLogo />`);

    assert
      .dom('[data-test-appLogo-img]')
      .exists()
      .hasNoClass(/app-logo-image-rounded/i);

    await render(hbs`<AppLogo @rounded={{true}}/>`);

    assert
      .dom('[data-test-appLogo-img]')
      .exists()
      .hasClass(/app-logo-image-rounded/i);
  });

  test('it renders app-logo with border', async function (assert) {
    await render(hbs`<AppLogo />`);

    assert
      .dom('[data-test-app-logo-container]')
      .exists()
      .hasClass(/app-logo-container-border/i);

    await render(hbs`<AppLogo @border={{false}}/>`);

    assert
      .dom('[data-test-app-logo-container]')
      .exists()
      .hasNoClass(/app-logo-container-border/i);
  });
});
