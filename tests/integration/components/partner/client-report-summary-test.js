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
          riskCountCritical: 3,
          riskCountHigh: 5,
          riskCountMedium: 8,
          riskCountLow: 13,
          riskCountPassed: 21,
          riskCountUntested: 34,
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

      assert
        .dom('[data-test-riskblock-critical]')
        .hasAttribute('style', `width: ${fileSummary.criticalPercent}%`);
      assert
        .dom('[data-test-riskblock-high]')
        .hasAttribute('style', `width: ${fileSummary.highPercent}%`);
      assert
        .dom('[data-test-riskblock-medium]')
        .hasAttribute('style', `width: ${fileSummary.mediumPercent}%`);
      assert
        .dom('[data-test-riskblock-low]')
        .hasAttribute('style', `width: ${fileSummary.lowPercent}%`);
      assert
        .dom('[data-test-riskblock-passed]')
        .hasAttribute('style', `width: ${fileSummary.passedPercent}%`);
      assert
        .dom('[data-test-riskblock-untested]')
        .hasAttribute('style', `width: ${fileSummary.untestedPercent}%`);

      assert
        .dom(`[data-test-riskblock-critical]`)
        .hasClass(styles['riskblock--critical']);
      assert
        .dom(`[data-test-riskblock-high]`)
        .hasClass(styles['riskblock--high']);
      assert
        .dom(`[data-test-riskblock-medium]`)
        .hasClass(styles['riskblock--medium']);
      assert
        .dom(`[data-test-riskblock-low]`)
        .hasClass(styles['riskblock--low']);
      assert
        .dom(`[data-test-riskblock-passed]`)
        .hasClass(styles['riskblock--passed']);
      assert
        .dom(`[data-test-riskblock-untested]`)
        .hasClass(styles['riskblock--untested']);
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

      assert
        .dom(`[data-test-riskindex-critical-key]`)
        .hasClass(styles['riskkey-color--critical']);

      assert.dom(`[data-test-riskindex-critical-label]`).hasText(t('critical'));

      assert
        .dom(`[data-test-riskindex-critical-count]`)
        .hasText(`${fileSummary.riskCountCritical}`);

      assert
        .dom(`[data-test-riskindex-high-key]`)
        .hasClass(styles['riskkey-color--high']);

      assert.dom(`[data-test-riskindex-high-label]`).hasText(t('high'));

      assert
        .dom(`[data-test-riskindex-high-count]`)
        .hasText(`${fileSummary.riskCountHigh}`);

      assert
        .dom(`[data-test-riskindex-medium-key]`)
        .hasClass(styles['riskkey-color--medium']);

      assert.dom(`[data-test-riskindex-medium-label]`).hasText(t('medium'));

      assert
        .dom(`[data-test-riskindex-medium-count]`)
        .hasText(`${fileSummary.riskCountMedium}`);

      assert
        .dom(`[data-test-riskindex-low-key]`)
        .hasClass(styles['riskkey-color--low']);

      assert.dom(`[data-test-riskindex-low-label]`).hasText(t('low'));

      assert
        .dom(`[data-test-riskindex-low-count]`)
        .hasText(`${fileSummary.riskCountLow}`);

      assert
        .dom(`[data-test-riskindex-passed-key]`)
        .hasClass(styles['riskkey-color--passed']);

      assert.dom(`[data-test-riskindex-passed-label]`).hasText(t('passed'));

      assert
        .dom(`[data-test-riskindex-passed-count]`)
        .hasText(`${fileSummary.riskCountPassed}`);

      assert
        .dom(`[data-test-riskindex-untested-key]`)
        .hasClass(styles['riskkey-color--untested']);

      assert.dom(`[data-test-riskindex-untested-label]`).hasText(t('untested'));

      assert
        .dom(`[data-test-riskindex-untested-count]`)
        .hasText(`${fileSummary.riskCountUntested}`);
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

      this.server.create('partner/partnerclient-file-summary', {
        riskCountCritical: 10,
        riskCountHigh: 20,
        riskCountMedium: 5,
        riskCountLow: 15,
        riskCountPassed: 30,
        riskCountUntested: 20,
      });
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
      assert
        .dom('[data-test-riskblock-critical]')
        .hasAttribute('style', `width: 10%`);
      assert
        .dom('[data-test-riskblock-high]')
        .hasAttribute('style', `width: 20%`);
      assert
        .dom('[data-test-riskblock-medium]')
        .hasAttribute('style', `width: 5%`);
      assert
        .dom('[data-test-riskblock-low]')
        .hasAttribute('style', `width: 15%`);
      assert
        .dom('[data-test-riskblock-passed]')
        .hasAttribute('style', `width: 30%`);
      assert
        .dom('[data-test-riskblock-untested]')
        .hasAttribute('style', `width: 20%`);
    });
  }
);
