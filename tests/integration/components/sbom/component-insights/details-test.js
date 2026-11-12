import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/component-insights/details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      this.sbomComponent = store.push(
        store.normalize(
          'sbom-component',
          this.server
            .create('sbom-component', {
              id: 1,
              version: '2.9.1',
              latest_version: '2.17.0',
              licenses: ['Apache-2.0'],
              is_dependency: false,
            })
            .toJSON()
        )
      );
    });

    test('it summarises inline when collapsed and expands to the summary', async function (assert) {
      await render(hbs`
        <Sbom::ComponentInsights::Details @sbomComponent={{this.sbomComponent}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-details-inlineSummary]')
        .hasText('Direct · v2.9.1 · Latest 2.17.0 · Apache-2.0');

      assert
        .dom('[data-test-sbomComponentInsights-details-content]')
        .doesNotExist();

      assert
        .dom('[data-test-sbomComponentInsights-details-toggle]')
        .hasAttribute('aria-expanded', 'false');

      await click('[data-test-sbomComponentInsights-details-toggle]');

      assert
        .dom('[data-test-sbomComponentInsights-details-toggle]')
        .hasAttribute('aria-expanded', 'true');

      assert
        .dom('[data-test-sbomComponentInsights-details-inlineSummary]')
        .doesNotExist();

      assert
        .dom('[data-test-sbomScanDetails-componentDetails-summary]')
        .exists();
    });

    test('it never shows a via line, collapsed or expanded', async function (assert) {
      this.sbomComponent.isDependency = true;
      this.sbomComponent.via = 'okhttp';

      await render(hbs`
        <Sbom::ComponentInsights::Details @sbomComponent={{this.sbomComponent}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-details-via]')
        .doesNotExist();

      assert.dom(this.element).doesNotIncludeText('via okhttp');

      await click('[data-test-sbomComponentInsights-details-toggle]');

      assert
        .dom('[data-test-sbomComponentInsights-details-via]')
        .doesNotExist();

      assert.dom(this.element).doesNotIncludeText('via okhttp');
    });
  }
);
