import { render } from '@ember/test-helpers';
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
      });

      this.server.create('project', { file: file.id, id: '1' });

      // set properties
      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
      });

      await this.owner.lookup('service:organization').load();

      // server mocks
      this.server.get('/v2/files/:id/dynamicscans', (schema, req) => {
        const { limit, mode } = req.queryParams || {};

        const results = schema.dynamicscans
          .where({
            file: req.params.id,
            ...(mode ? { mode: Number(mode) } : {}),
          })
          .models.slice(0, limit ? Number(limit) : results.length);

        return {
          count: results.length,
          next: null,
          previous: null,
          results,
        };
      });
    });

    test('it renders dynamic scan title & btn', async function (assert) {
      this.server.get('/manualscans/:id', (schema, req) => {
        return { id: req.params.id };
      });

      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
      this.file.isDynamicDone = false;

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      await render(hbs`
        <FileDetails::ScanActions::DynamicScan @file={{this.file}} />
      `);

      assert
        .dom('[data-test-fileDetailScanActions-dynamicScanTitle]')
        .hasText(t('dast'));

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
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
          manualStatus: null,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus:
            ENUMS.DYNAMIC_SCAN_STATUS.INITIATING_AUTO_INTERACTION,
          manualStatus: null,
          expectedText: () => t('inProgress'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          expectedText: () => t('completed'),
        },
        {
          automatedStatus: ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
          manualStatus: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          expectedText: () => t('errored'),
        },
        {
          automatedStatus: null,
          manualStatus: null,
          expectedText: () => t('notStarted'),
        },
      ],
      async function (assert, { automatedStatus, manualStatus, expectedText }) {
        // Create dynamicscan objects in the store
        if (automatedStatus) {
          this.server.create('dynamicscan', {
            id: '1',
            file: this.file.id,
            mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
            status: automatedStatus,
          });
        }

        if (manualStatus) {
          this.server.create('dynamicscan', {
            id: '2',
            file: this.file.id,
            mode: ENUMS.DYNAMIC_MODE.MANUAL,
            status: manualStatus,
          });
        }

        await render(hbs`
          <FileDetails::ScanActions::DynamicScan 
            @file={{this.file}} 
          />
        `);

        assert
          .dom('[data-test-fileDetailScanActions-dynamicScanStatus]')
          .exists()
          .hasText(expectedText());
      }
    );
  }
);
