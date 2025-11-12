import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module(
  'Integration | Component | file-details/scan-actions/manual-scan',
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

      this.server.create('project', { last_file: file, id: '1' });

      const manualscan = this.server.create('manualscan', { id: file.id });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        manualscan,
        file_risk_info,
      });

      await this.owner.lookup('service:organization').load();
    });

    test('it renders manual scan title & btn', async function (assert) {
      this.server.create('manualscan', { id: this.file.id });

      this.file.manual = ENUMS.MANUAL.NONE;
      this.file.isManualDone = false;

      // make sure file is active
      this.file.isActive = true;

      this.server.get('/v3/projects/:id', (schema, req) => {
        return {
          ...schema.projects.find(`${req.params.id}`)?.toJSON(),
          is_manual_scan_available: true,
        };
      });

      this.server.get('/manualscans/:id', (schema, req) => {
        return schema.manualscans.find(`${req.params.id}`)?.toJSON();
      });

      await render(hbs`
        <FileDetails::ScanActions
          @file={{this.file}}
          @vulnerabilityCount={{this.file_risk_info.risk_count_by_scan_type.manual}}
        />
      `);

      assert.dom('[data-test-fileDetailScanActions-scan-type-cards]').exists();

      assert
        .dom('[data-test-fileDetailScanActions-manualScanTitle]')
        .hasText(t('manualScan'));

      assert
        .dom('[data-test-fileDetailScanActions-manualScanNotStartedStatus]')
        .hasText(t('notStarted'));
    });

    test.each(
      'it renders different states of manual scan button',
      [
        { manual: ENUMS.MANUAL.NONE, done: false },
        { manual: ENUMS.MANUAL.NONE, done: false, disabled: true },
        { manual: ENUMS.MANUAL.REQUESTED, done: false },
        { manual: ENUMS.MANUAL.REQUESTED, done: true },
        { manual: ENUMS.MANUAL.ASSESSING, done: false },
        { manual: ENUMS.MANUAL.ASSESSING, done: true },
      ],
      async function (assert, scan) {
        this.file.manual = scan.manual;
        this.file.isManualDone = scan.done;

        this.file.isActive = !scan.disabled;

        this.server.get('/manualscans/:id', (schema, req) => {
          return schema.manualscans.find(`${req.params.id}`)?.toJSON();
        });

        await render(hbs`
          <FileDetails::ScanActions::ManualScan
            @file={{this.file}}
            @vulnerabilityCount={{this.file_risk_info.risk_count_by_scan_type.manual}}
          />
        `);

        if (this.file.manual === ENUMS.MANUAL.ASSESSING) {
          assert
            .dom('[data-test-fileDetailScanActions-manualScanStatus]')
            .hasText(this.file.isManualDone ? t('completed') : t('inProgress'));
        } else if (this.file.isManualRequested) {
          assert
            .dom('[data-test-fileDetailScanActions-manualScanStatus]')
            .hasText(this.file.isManualDone ? t('completed') : t('requested'));
        } else {
          assert
            .dom('[data-test-fileDetailScanActions-manualScanNotStartedStatus]')
            .hasText(t('notStarted'));
        }

        // Scan overview section
        const vulnerabilityCount = this.file.isManualDone
          ? String(this.file_risk_info.risk_count_by_scan_type.manual)
          : '-';

        const scanOverviewSection = find(
          '[data-test-fileDetails-scanActions-scanOverview-manualScanRoot]'
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
