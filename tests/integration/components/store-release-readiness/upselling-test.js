import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

module(
  'Integration | Component | store-release-readiness/upselling',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);
    setupBrowserFakes(hooks, { window: true, localStorage: true });

    hooks.beforeEach(async function () {
      const window = this.owner.lookup('service:browser/window');
      window.localStorage.clear();

      this.setProperties({ window });
    });

    test('it renders', async function (assert) {
      await render(hbs`
        <StoreReleaseReadiness::Upselling />
      `);

      assert.dom('[data-test-upselling-module]').exists();

      assert
        .dom('[data-test-store-release-readiness-upselling-image]')
        .exists();

      assert
        .dom('[data-test-upselling-module-title]')
        .hasText(t('storeReleaseReadiness.introducing'));

      assert
        .dom('[data-test-upselling-module-subtitle]')
        .hasText(t('storeReleaseReadiness.overview'));

      const featureElements = findAll('[data-test-upselling-module-feature]');

      assert.strictEqual(featureElements.length, 3);

      assert
        .dom(featureElements[0])
        .hasText(t('storeReleaseReadiness.features.1'));

      assert
        .dom(featureElements[1])
        .hasText(t('storeReleaseReadiness.features.2'));

      assert
        .dom(featureElements[2])
        .hasText(t('storeReleaseReadiness.features.3'));

      assert.dom('[data-test-upselling-module-contact-cta]').exists();
      assert.dom('[data-test-upselling-module-successMessage]').doesNotExist();
    });

    test('it stores user interest in localStorage and updates UI', async function (assert) {
      this.server.post('/v2/feature_request/store_release_readiness', () => {
        return 200;
      });

      await render(hbs`
        <StoreReleaseReadiness::Upselling />
      `);

      assert.dom('[data-test-upselling-module-contact-cta]').exists();

      await click('[data-test-upselling-module-contact-cta]');

      assert.strictEqual(
        this.window.localStorage.getItem('storeReleaseReadinessRequest'),
        'true'
      );

      assert.dom('[data-test-upselling-module-contact-cta]').doesNotExist();

      assert
        .dom('[data-test-upselling-module-successMessage]')
        .hasText(
          t('storeReleaseReadiness.contactMessage').replace(/<[^>]+>/g, '')
        );

      assert.dom('[data-test-upselling-module-thumbs-up]').exists();
    });
  }
);
