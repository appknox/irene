import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module(
  'Integration | Component | file-details/scan-actions/api-scan',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const { file_risk_info } = setupFileModelEndpoints(this.server);

      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      this.server.create('project', {
        last_file: file,
        id: '1',
        platform: ENUMS.PLATFORM.ANDROID,
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        store,
        file_risk_info,
      });

      await this.owner.lookup('service:organization').load();
    });

    test('it renders api scan title & btn', async function (assert) {
      this.server.get('/manualscans/:id', (schema, req) => {
        return { id: req.params.id };
      });

      this.file.isDynamicDone = true;
      this.file.isApiDone = false;

      // make sure file is active
      this.file.isActive = true;

      this.server.get('/v3/projects/:id', (schema, req) => {
        return {
          ...schema.projects.find(`${req.params.id}`)?.toJSON(),
          platform: ENUMS.PLATFORM.ANDROID, // enables api scan
        };
      });

      await render(hbs`
          <FileDetails::ScanActions @file={{this.file}} @vulnerabilityCount={{this.file_risk_info.risk_count_by_scan_type.api}} />
      `);

      assert.dom('[data-test-fileDetailScanActions-scan-type-cards]').exists();

      assert
        .dom('[data-test-fileDetailScanActions-apiScanTitle]')
        .hasText(t('apiScan'));

      assert
        .dom('[data-test-fileDetailScanActions-apiScanNotStartedStatus]')
        .hasText(t('notStarted'));
    });

    test.each(
      'test different states of api scan',
      [
        { status: ENUMS.SCAN_STATUS.RUNNING },
        { status: ENUMS.SCAN_STATUS.COMPLETED },
        { status: ENUMS.SCAN_STATUS.UNKNOWN },
        { status: ENUMS.SCAN_STATUS.UNKNOWN, disabled: true },
      ],
      async function (assert, { status, disabled }) {
        this.file.apiScanStatus = status;

        if (status === ENUMS.SCAN_STATUS.COMPLETED) {
          this.file.isApiDone = true;
        } else {
          this.file.isApiDone = false;
        }

        this.file.isDynamicDone = !disabled;

        // make sure file is active
        this.file.isActive = true;

        this.server.get('/v3/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        await render(hbs`
          <FileDetails::ScanActions::ApiScan
            @file={{this.file}}
            @vulnerabilityCount={{this.file_risk_info.risk_count_by_scan_type.api}}
          />
        `);

        if (this.file.isRunningApiScan) {
          assert
            .dom('[data-test-fileDetailScanActions-apiScanInProgressStatus]')
            .hasText(`${t('scanning')}... ${this.file.apiScanProgress}%`);
        } else if (this.file.isApiDone) {
          assert
            .dom('[data-test-fileDetailScanActions-apiScanCompletedStatus]')
            .hasText(t('completed'));
        } else {
          assert
            .dom('[data-test-fileDetailScanActions-apiScanNotStartedStatus]')
            .hasText(t('notStarted'));
        }

        // Scan overview section
        const vulnerabilityCount = this.file.isApiDone
          ? String(this.file_risk_info.risk_count_by_scan_type.api)
          : '-';

        const scanOverviewSection = find(
          '[data-test-fileDetails-scanActions-scanOverview-apiScanRoot]'
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
