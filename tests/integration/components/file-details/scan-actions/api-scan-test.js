import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';

module(
  'Integration | Component | file-details/scan-actions/api-scan',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      this.server.create('project', {
        file: file.id,
        id: '1',
        platform: ENUMS.PLATFORM.ANDROID,
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        store,
      });

      await this.owner.lookup('service:organization').load();
    });

    test('it renders api scan title & btn', async function (assert) {
      this.server.get('/manualscans/:id', (schema, req) => {
        return { id: req.params.id };
      });

      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
      this.file.isDynamicDone = true;
      this.file.isApiDone = false;

      // make sure file is active
      this.file.isActive = true;

      this.server.get('/v2/projects/:id', (schema, req) => {
        return {
          ...schema.projects.find(`${req.params.id}`)?.toJSON(),
          platform: ENUMS.PLATFORM.ANDROID, // enables api scan
        };
      });

      await render(hbs`
          <FileDetails::ScanActions @file={{this.file}} />
      `);

      assert.dom('[data-test-fileDetailScanActions-scan-type-cards]').exists();

      assert
        .dom('[data-test-fileDetailScanActions-apiScanTitle]')
        .hasText('t:apiScan:()');

      assert
        .dom('[data-test-fileDetailScanActions-apiScanNotStartedStatus]')
        .hasText('t:notStarted:()');
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

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        await render(hbs`
            <FileDetails::ScanActions::ApiScan @file={{this.file}} />
        `);

        if (this.file.isRunningApiScan) {
          assert
            .dom('[data-test-fileDetailScanActions-apiScanInProgressStatus]')
            .hasText(`t:scanning:()... ${this.file.apiScanProgress}%`);
        } else if (this.file.isApiDone) {
          assert
            .dom('[data-test-fileDetailScanActions-apiScanCompletedStatus]')
            .hasText('t:completed:()');
        } else {
          assert
            .dom('[data-test-fileDetailScanActions-apiScanNotStartedStatus]')
            .hasText('t:notStarted:()');
        }
      }
    );
  }
);
