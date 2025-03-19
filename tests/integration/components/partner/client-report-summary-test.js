import { module, test } from 'qunit';
import { Response } from 'miragejs';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { serializer } from 'irene/tests/test-utils';
import styles from 'irene/components/partner/client-report-summary/index.scss';

module(
  'Integration | Component | partner/client-report-summary',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      await this.server.create('organization');
      await this.owner.lookup('service:organization').load();
    });

    test('it should render graph with risk colors', async function (assert) {
      this.server.create('partner/partner', {
        access: { list_files: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      const fileSummary = this.server.create(
        'partner/partnerclient-file-summary',
        {
          riskCountCritical: 10,
          riskCountHigh: 20,
          riskCountMedium: 5,
          riskCountLow: 15,
          riskCountPassed: 30,
          riskCountUntested: 20,
        }
      );
      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/summary',
        (schema) => {
          const data = schema['partner/partnerclientFileSummaries'].find(1);
          return serializer(data);
        }
      );
      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportSummary @clientId={{this.clientId}} @fileId={{this.fileId}}/>`
      );
      assert.dom('[data-test-report-summary]').exists();
      assert.dom('[data-test-risk-summary]').exists();

      assert.dom('[data-test-risk-summary-bar]').exists();
      assert.dom('[data-test-risk-summary-bar]').hasClass(styles['riskbar']);

      // Risk Summary bar assertion
      const riskWidthProps = [
        ['critical', fileSummary.criticalPercent],
        ['high', fileSummary.highPercent],
        ['medium', fileSummary.mediumPercent],
        ['low', fileSummary.lowPercent],
        ['passed', fileSummary.passedPercent],
        ['untested', fileSummary.untestedPercent],
      ];

      // Risks assertion
      riskWidthProps.forEach(([key, width]) => {
        assert
          .dom(`[data-test-riskblock="${key}"]`)
          .hasAttribute('style', new RegExp(`width: ${width}%`, 'i'))
          .hasClass(styles[`riskblock--${key}`]);
      });
    });

    test('it should render risk index tooltip on mouseenter', async function (assert) {
      this.server.create('partner/partner', {
        access: { list_files: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();
      const fileSummary = this.server.create(
        'partner/partnerclient-file-summary'
      );
      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/summary',
        (schema) => {
          const data = schema['partner/partnerclientFileSummaries'].find(1);
          return serializer(data);
        }
      );
      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('indexPlacement', 'bottom');

      await render(
        hbs`
        <Partner::ClientReportSummary
          @clientId={{this.clientId}}
          @fileId={{this.fileId}}
          @indexPlacement={{this.indexPlacement}}
        />`
      );

      assert.dom('[data-test-report-summary]').exists();
      assert.dom('[data-test-risk-summary]').exists();

      assert.dom('[data-test-risk-summary-bar]').exists();

      const reportSummaryTooltip = find(
        '[data-test-report-summary] [data-test-ak-tooltip-root]'
      );

      await triggerEvent(reportSummaryTooltip, 'mouseenter');

      assert.dom('[data-test-risk-summary-tooltip]').exists();

      // Risks assertion
      const riskProps = [
        ['critical', t('critical'), fileSummary?.riskCountCritical],
        ['high', t('high'), fileSummary?.riskCountHigh],
        ['medium', t('medium'), fileSummary?.riskCountMedium],
        ['low', t('low'), fileSummary?.riskCountLow],
        ['passed', t('passed'), fileSummary?.riskCountPassed],
        ['untested', t('untested'), fileSummary?.riskCountUntested],
      ];

      riskProps.forEach(([key, label, riskCount]) => {
        assert
          .dom(`[data-test-riskindex-key="${key}"]`)
          .hasClass(styles[`riskkey-color--${key}`]);

        assert.dom(`[data-test-riskindex-label="${key}"]`).hasText(label);

        assert
          .dom(`[data-test-riskindex-count="${key}"]`)
          .hasText(String(riskCount));
      });
    });

    test('it should not render graph and popover if summary api fails', async function (assert) {
      this.server.create('partner/partner', {
        access: { list_files: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/summary',
        () => {
          return new Response(500);
        }
      );
      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportSummary @clientId={{this.clientId}} @fileId={{this.fileId}}/>`
      );
      assert.dom('[data-test-report-summary]').exists();
      assert.dom('[data-test-risk-summary]').doesNotExist();
      assert.dom('[class="ember-attacher-popper"]').doesNotExist();
    });

    test('it should not render graph and popover if list_files privilege not provided', async function (assert) {
      this.server.create('partner/partner', {
        access: { list_files: false },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/summary',
        () => {
          return new Response(403);
        }
      );
      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportSummary @clientId={{this.clientId}} @fileId={{this.fileId}}/>`
      );
      assert.dom('[data-test-report-summary]').doesNotExist();
      assert.dom('[data-test-risk-summary]').doesNotExist();
      assert.dom('[class="ember-attacher-popper"]').doesNotExist();
    });

    test('it should render graph risk block widths based on risk counts', async function (assert) {
      this.server.create('partner/partner', {
        access: { list_files: true },
      });

      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });

      await this.owner.lookup('service:partner').load();

      const fileSummary = this.server.create(
        'partner/partnerclient-file-summary',
        {
          riskCountCritical: 10,
          riskCountHigh: 20,
          riskCountMedium: 5,
          riskCountLow: 15,
          riskCountPassed: 30,
          riskCountUntested: 20,
        }
      );

      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/summary',
        (schema) => {
          const data = schema['partner/partnerclientFileSummaries'].find(1);
          return serializer(data);
        }
      );

      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportSummary @clientId={{this.clientId}} @fileId={{this.fileId}}/>`
      );
      assert.dom('[data-test-risk-summary-bar]').exists();

      const riskWidthProps = [
        ['critical', fileSummary.criticalPercent],
        ['high', fileSummary.highPercent],
        ['medium', fileSummary.mediumPercent],
        ['low', fileSummary.lowPercent],
        ['passed', fileSummary.passedPercent],
        ['untested', fileSummary.untestedPercent],
      ];

      // Risks assertion
      riskWidthProps.forEach(([key, width]) => {
        assert
          .dom(`[data-test-riskblock="${key}"]`)
          .hasAttribute('style', new RegExp(`width: ${width}%`, 'i'));
      });
    });
  }
);
