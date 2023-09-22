import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

const staticScanStatus = {
  completed: 'completed',
  inProgress: 'inProgress',
};

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }
}

module('Integration | Component | file-details/scan-actions', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');

    const file = this.server.create('file', {
      project: '1',
    });

    this.server.create('project', { file: file.id, id: '1' });

    this.setProperties({
      file: store.push(store.normalize('file', file.toJSON())),
      store,
    });

    await this.owner.lookup('service:organization').load();
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders scan actions', async function (assert) {
    this.server.get('/manualscans/:id', (schema, req) => {
      return { id: req.params.id };
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
        <FileDetails::ScanActions @file={{this.file}} />
    `);

    assert
      .dom('[data-test-fileDetailScanActions-title]')
      .hasText('t:scanTypes:()');
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

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      await render(hbs`
        <FileDetails::ScanActions @file={{this.file}} />
      `);

      assert
        .dom('[data-test-fileDetailScanActions-title]')
        .hasText('t:scanTypes:()');

      assert
        .dom('[data-test-fileDetailScanActions-staticScanTitle]')
        .hasText('t:staticScan:()');

      if (scanStatus === staticScanStatus.completed) {
        assert
          .dom('[data-test-fileDetailScanActions-staticScanCompletedStatus]')
          .hasText('t:completed:()');

        assert
          .dom('[data-test-fileDetailScanActions-staticScanRestartBtn]')
          .isNotDisabled();
      } else {
        assert
          .dom('[data-test-fileDetailScanActions-staticScanInProgressStatus]')
          .hasText('t:scanning:() : ' + this.file.staticScanProgress + '%');
      }
    }
  );

  test('test restart static scan', async function (assert) {
    this.file.isStaticDone = true;

    this.server.get('/manualscans/:id', (schema, req) => {
      return { id: req.params.id };
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.post('/rescan', () => {});

    await render(hbs`
      <FileDetails::ScanActions @file={{this.file}} />
    `);

    assert
      .dom('[data-test-fileDetailScanActions-staticScanCompletedStatus]')
      .hasText('t:completed:()');

    assert
      .dom('[data-test-fileDetailScanActions-staticScanRestartBtn]')
      .isNotDisabled();

    await click('[data-test-fileDetailScanActions-staticScanRestartBtn]');

    assert
      .dom('[data-test-ak-modal-header]')
      .hasText('t:modalCard.rescan.title:()');

    assert
      .dom('[data-test-confirmbox-description]')
      .hasText('t:modalCard.rescan.description:()');

    assert.dom('[data-test-confirmbox-confirmBtn]').hasText('t:yes:()');

    assert.dom('[data-test-confirmbox-cancelBtn]').hasText('t:no:()');

    await click('[data-test-confirmbox-confirmBtn]');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.infoMsg, 't:rescanInitiated:()');
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
        <FileDetails::ScanActions @file={{this.file}} />
    `);

    assert
      .dom('[data-test-fileDetailScanActions-title]')
      .hasText('t:scanTypes:()');

    assert
      .dom('[data-test-fileDetailScanActions-dynamicScanTitle]')
      .hasText('t:dynamicScan:()');

    assert.dom('[data-test-dynamicScan-startBtn]').hasText('t:start:()');

    assert.dom('[data-test-dynamicScan-restartBtn]').doesNotExist();
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

    assert
      .dom('[data-test-fileDetailScanActions-title]')
      .hasText('t:scanTypes:()');

    assert
      .dom('[data-test-fileDetailScanActions-apiScanTitle]')
      .hasText('t:apiScan:()');

    assert.dom('[data-test-apiScan-btn]').isNotDisabled().hasText('t:start:()');
  });

  test('it renders manual scan title & btn', async function (assert) {
    this.server.create('manualscan', { id: this.file.id });

    this.file.manual = ENUMS.MANUAL.NONE;
    this.file.isManualDone = false;

    // make sure file is active
    this.file.isActive = true;

    this.server.get('/v2/projects/:id', (schema, req) => {
      return {
        ...schema.projects.find(`${req.params.id}`)?.toJSON(),
        is_manual_scan_available: true,
      };
    });

    this.server.get('/manualscans/:id', (schema, req) => {
      return schema.manualscans.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
        <FileDetails::ScanActions @file={{this.file}} />
    `);

    assert
      .dom('[data-test-fileDetailScanActions-title]')
      .hasText('t:scanTypes:()');

    assert
      .dom('[data-test-fileDetailScanActions-manualScanTitle]')
      .hasText('t:manualScan:()');

    assert
      .dom('[data-test-manualScan-requestBtn]')
      .isNotDisabled()
      .hasText('t:start:()');
  });

  test('it renders inactive file icon', async function (assert) {
    this.server.get('/manualscans/:id', (schema, req) => {
      return { id: req.params.id };
    });

    this.file.isActive = false;

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
        <FileDetails::ScanActions @file={{this.file}} />
    `);

    assert
      .dom('[data-test-fileDetailScanActions-title]')
      .hasText('t:scanTypes:()');

    assert.dom('[data-test-fileDetailScanActions-inactiveFileIcon]').exists();
  });
});
