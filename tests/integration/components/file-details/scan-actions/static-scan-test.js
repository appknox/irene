import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

const staticScanStatus = {
  completed: 'completed',
  inProgress: 'inProgress',
};

module(
  'Integration | Component | file-details/scan-actions/static-scan',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const { file_risk_info } = setupFileModelEndpoints(this.server);
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', {
        project: '1',
      });

      this.server.create('project', { last_file: file, id: '1' });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        file_risk_info,
      });

      await this.owner.lookup('service:organization').load();
    });

    test.each(
      'test different states of static scan',
      [staticScanStatus.completed, staticScanStatus.inProgress],
      async function (assert, scanStatus) {
        if (scanStatus === staticScanStatus.completed) {
          this.file.isStaticDone = true;
        } else {
          this.file.isStaticDone = false;
          this.file.staticScanProgress = 80;
        }

        this.server.get('/manualscans/:id', (schema, req) => {
          return { id: req.params.id };
        });

        this.server.get('/v3/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        await render(hbs`
        <FileDetails::ScanActions
          @file={{this.file}}
          @vulnerabilityCount={{this.file_risk_info.risk_count_by_scan_type.static}}
        />
      `);

        assert
          .dom('[data-test-fileDetailScanActions-scan-type-cards]')
          .exists();

        assert
          .dom('[data-test-fileDetailScanActions-staticScanTitle]')
          .hasText(t('staticScan'));

        if (scanStatus === staticScanStatus.completed) {
          assert
            .dom('[data-test-fileDetailScanActions-staticScanCompletedStatus]')
            .hasText(t('completed'));
        } else {
          assert
            .dom('[data-test-fileDetailScanActions-staticScanInProgressStatus]')
            .hasText(`${t('scanning')}... ${this.file.staticScanProgress}%`);
        }

        // Scan overview section
        const vulnerabilityCount = this.file.isStaticDone
          ? String(this.file_risk_info.risk_count_by_scan_type.static)
          : '-';

        const scanOverviewSection = find(
          '[data-test-fileDetails-scanActions-scanOverview-staticScanRoot]'
        );

        assert
          .dom(
            '[data-test-fileDetails-scanActions-scanOverview-vulnerabilitiesFoundIcon]',
            scanOverviewSection
          )
          .exists();

        assert
          .dom(scanOverviewSection)
          .containsText(t('scanOverview'))
          .containsText(vulnerabilityCount);

        // Vulnerabilities found tooltip
        const vulnerabilitiesFoundTooltip = find(
          '[data-test-fileDetails-scanActions-scanOverview-vulnerabilitiesFoundTooltip]'
        );

        await triggerEvent(vulnerabilitiesFoundTooltip, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .containsText(t('vulnerabilitiesFound'));

        await triggerEvent(vulnerabilitiesFoundTooltip, 'mouseleave');
      }
    );
  }
);
