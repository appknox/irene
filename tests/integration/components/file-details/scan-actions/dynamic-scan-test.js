import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';

module(
  'Integration | Component | file-details/scan-actions/dynamic-scan',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', {
        project: '1',
        last_manual_dynamic_scan: null,
        last_automated_dynamic_scan: null,
        is_active: true,
      });

      this.server.create('project', { file: file.id, id: '1' });

      // set properties
      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        store,
      });

      await this.owner.lookup('service:organization').load();

      // server mocks
      this.server.get('/v2/dynamicscans/:id', (schema, req) => {
        return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });
    });

    test('it renders dynamic scan title & btn', async function (assert) {
      this.server.get('/manualscans/:id', (schema, req) => {
        return { id: req.params.id };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      await render(hbs`
        <FileDetails::ScanActions::DynamicScan @file={{this.file}} />
      `);

      assert
        .dom('[data-test-fileDetailScanActions-dynamicScanTitle]')
        .hasText(t('dynamicScan'));

      assert
        .dom('[data-test-fileDetailScanActions-dynamicScanStatus]')
        .hasText(t('notStarted'));

      assert
        .dom('[data-test-fileDetailScanActions-dynamicScanViewDetails]')
        .hasText(t('viewDetails'))
        .hasAttribute(
          'href',
          `/dashboard/file/${this.file.id}/dynamic-scan/manual`
        );
    });

    test.each(
      'it renders different states of dynamic scan',
      [
        // No scan scenarios
        {
          automatedStatus: null,
          manualStatus: null,
          expectedText: () => t('notStarted'),
        },

        // Running scenarios
        {
          automatedStatus: null,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
          manualStatus: null,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.AUTO_INTERACTION_COMPLETED,
          manualStatus: null,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.RUNNING,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus:
            ENUMS.DYNAMIC_SCAN_STATUS.INITIATING_AUTO_INTERACTION,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus:
            ENUMS.DYNAMIC_SCAN_STATUS.INITIATING_AUTO_INTERACTION,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          expectedText: () => t('inProgress'),
        },

        // Error scenarios
        {
          automatedStatus: null,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          expectedText: () => t('errored'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          manualStatus: null,
          expectedText: () => t('errored'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          expectedText: () => t('errored'),
        },

        // Completed scenarios
        {
          automatedStatus: null,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          expectedText: () => t('completed'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          manualStatus: null,
          expectedText: () => t('completed'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          expectedText: () => t('completed'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          expectedText: () => t('completed'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          expectedText: () => t('completed'),
        },

        // Not started & cancelled scenarios
        {
          automatedStatus: null,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED,
          expectedText: () => t('cancelled'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED,
          manualStatus: null,
          expectedText: () => t('cancelled'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED,
          expectedText: () => t('cancelled'),
        },
      ],
      async function (assert, { automatedStatus, manualStatus, expectedText }) {
        // Create dynamicscan objects in the server
        if (automatedStatus) {
          this.dsAutomatedScan = this.server.create('dynamicscan', {
            id: '1',
            file: '10',
            mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
            status: automatedStatus,
          });
        }

        if (manualStatus) {
          this.dsManualScan = this.server.create('dynamicscan', {
            id: '2',
            file: '10',
            mode: ENUMS.DYNAMIC_MODE.MANUAL,
            status: manualStatus,
          });
        }

        // create file with latest dynamic scan
        this.file = this.store.push(
          this.store.normalize(
            'file',
            this.server
              .create('file', {
                id: '10',
                last_manual_dynamic_scan: this.dsManualScan?.id ?? null,
                last_automated_dynamic_scan: this.dsAutomatedScan?.id ?? null,
                is_active: true,
              })
              .toJSON()
          )
        );

        // Scan coverage model
        const scan_coverage = this.server.create('scan-coverage', {
          status: ENUMS.SCAN_COVERAGE_STATUS.COMPLETED,
          is_any_screen_coverage_complete: true,
        });

        this.scanCoverage = this.store.push(
          this.store.normalize('scan-coverage', scan_coverage.toJSON())
        );

        // Server mocks
        this.server.get('/v2/files/:id/screen_coverage', (schema) => {
          return this.file.isDynamicDone
            ? schema.scanCoverages.find(scan_coverage.id)?.toJSON()
            : null;
        });

        await render(hbs`
          <FileDetails::ScanActions::DynamicScan
            @file={{this.file}}
          />
        `);

        assert
          .dom('[data-test-fileDetailScanActions-dynamicScanStatus]')
          .exists()
          .hasText(expectedText());

        // Scan overview section
        const vulnerabilityCount = this.file.isDynamicDone
          ? String(this.file.dynamicVulnerabilityCount)
          : '-';

        const scanOverviewSection = find(
          '[data-test-fileDetails-scanActions-scanOverview-dynamicScanRoot]'
        );

        // Vulnerabilities found section
        assert
          .dom(
            '[data-test-fileDetails-scanActions-scanOverview-vulnerabilitiesFoundIcon]',
            scanOverviewSection
          )
          .exists();

        assert
          .dom(
            '[data-test-fileDetails-scanActions-scanOverview-vulnerabilitiesFoundValue]',
            scanOverviewSection
          )
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

        // Screen coverage section
        if (this.file.isDynamicDone) {
          // Screen coverage tooltip
          const screenCoverageTooltip = find(
            '[data-test-fileDetails-scanActions-scanOverview-screenCoverageTooltip]'
          );

          await triggerEvent(screenCoverageTooltip, 'mouseenter');

          assert
            .dom('[data-test-ak-tooltip-content]')
            .hasText(t('scanCoverage.screenCoverage'));

          await triggerEvent(screenCoverageTooltip, 'mouseleave');

          // Screen coverage section
          assert
            .dom(
              '[data-test-fileDetails-scanActions-scanOverview-screenCoverageRoot]',
              scanOverviewSection
            )
            .exists();

          assert
            .dom(
              '[data-test-fileDetails-scanActions-scanOverview-screenCoverageIcon]',
              scanOverviewSection
            )
            .exists();

          assert
            .dom(
              '[data-test-fileDetails-scanActions-scanOverview-screenCoverageValue]',
              scanOverviewSection
            )
            .hasText(`${String(this.scanCoverage.coverage)}%`);
        } else {
          assert
            .dom(
              '[data-test-fileDetails-scanActions-scanOverview-screenCoverageRoot]',
              scanOverviewSection
            )
            .doesNotExist();
        }
      }
    );
  }
);
