import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

module('Integration | Component | sbom/upselling', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);
  setupBrowserFakes(hooks, { window: true, localStorage: true });

  hooks.beforeEach(async function () {
    const window = this.owner.lookup('service:browser/window');
    window.localStorage.clear();

    this.setProperties({
      window,
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`
      <Sbom::Upselling />
    `);

    assert.dom('[data-test-upselling-module]').exists();

    assert.dom('[data-test-sbom-upselling-image]').exists();

    assert
      .dom('[data-test-upselling-module-title]')
      .hasText(t('sbomModule.introducingSBOM'));

    assert
      .dom('[data-test-upselling-module-subtitle]')
      .hasText(t('sbomModule.sbomOverview'));

    assert.dom('[data-test-upselling-module-feature]').exists({ count: 4 });

    const featureElements = document.querySelectorAll(
      '[data-test-upselling-module-feature]'
    );

    assert
      .dom(featureElements[0])
      .hasText(t('sbomModule.sbomFeatures.oneClickAnalysis'));

    assert
      .dom(featureElements[1])
      .hasText(t('sbomModule.sbomFeatures.identifyDependencies'));

    assert
      .dom(featureElements[2])
      .hasText(t('sbomModule.sbomFeatures.uncoverVulnerabilities'));

    assert
      .dom(featureElements[3])
      .hasText(t('sbomModule.sbomFeatures.componentInsights'));

    assert.dom('[data-test-upselling-module-contact-cta]').exists();
    assert.dom('[data-test-upselling-module-successMessage]').doesNotExist();
  });

  test('it stores user interest in localStorage and updates UI', async function (assert) {
    this.server.post('/v2/feature_request/sbom', () => {
      return 200;
    });

    await render(hbs`
      <Sbom::Upselling />
    `);

    assert.dom('[data-test-upselling-module-contact-cta]').exists();

    await click('[data-test-upselling-module-contact-cta]');

    assert.strictEqual(this.window.localStorage.getItem('sbomRequest'), 'true');

    assert.dom('[data-test-upselling-module-contact-cta]').doesNotExist();

    assert
      .dom('[data-test-upselling-module-successMessage]')
      .hasText(t('sbomModule.sbomContactMessage'));

    assert.dom('[data-test-upselling-module-thumbs-up]').exists();
  });
});
