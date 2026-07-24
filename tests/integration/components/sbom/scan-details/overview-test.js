import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/scan-details/overview',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const sbomScanSummary = this.server.create('sbom-scan-summary', 1);

      const sbomScanSummaryNormalized = store.normalize(
        'sbom-scan-summary',
        sbomScanSummary.toJSON()
      );

      this.setProperties({
        sbomScanSummary: store.push(sbomScanSummaryNormalized),
      });
    });

    test('it renders scan summary details without an ML Model entry or a heading', async function (assert) {
      await render(hbs`
        <Sbom::ScanDetails::Overview @sbomScanSummary={{this.sbomScanSummary}} />
      `);

      assert.dom('[data-test-sbomScanDetails-overview-container]').exists();
      assert.dom('[data-test-sbomScanDetails-overview-title]').doesNotExist();

      const expectedScanSummaryItems = [
        {
          label: t('sbomModule.totalComponents'),
          value: this.sbomScanSummary.componentCount,
          isPrimary: true,
        },
        {
          label: t('library'),
          value: this.sbomScanSummary.libraryCount,
        },
        {
          label: t('framework'),
          value: this.sbomScanSummary.frameworkCount,
        },
        {
          label: t('file'),
          value: this.sbomScanSummary.fileCount,
        },
      ];

      expectedScanSummaryItems.forEach((item) => {
        const summarySelector = `[data-test-sbomScanDetails-summaryBar-item="${item.label}"]`;
        const boldClass = /ak-typography-font-weight-bold/i;

        assert
          .dom(
            `${summarySelector} [data-test-sbomScanDetails-summaryBar-label]`
          )
          .hasText(item.label);

        assert
          .dom(
            `${summarySelector} [data-test-sbomScanDetails-summaryBar-value]`
          )
          .hasText(`${item.value}`);

        if (item.isPrimary) {
          assert
            .dom(
              `${summarySelector} [data-test-sbomScanDetails-summaryBar-label]`
            )
            .hasClass(boldClass);

          assert
            .dom(
              `${summarySelector} [data-test-sbomScanDetails-summaryBar-value]`
            )
            .hasClass(boldClass);
        } else {
          assert
            .dom(
              `${summarySelector} [data-test-sbomScanDetails-summaryBar-label]`
            )
            .doesNotHaveClass(boldClass);

          assert
            .dom(
              `${summarySelector} [data-test-sbomScanDetails-summaryBar-value]`
            )
            .doesNotHaveClass(boldClass);
        }
      });

      assert
        .dom('[data-test-sbomScanDetails-summaryBar-item]')
        .exists({ count: expectedScanSummaryItems.length });

      assert
        .dom(
          `[data-test-sbomScanDetails-summaryBar-item="${t('sbomModule.mlModel')}"]`
        )
        .doesNotExist();
    });
  }
);
