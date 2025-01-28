import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import ENUMS from 'irene/enums';

module('Unit | Service | dynamic-scan', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');

    // Helper function to push a model to store
    this.pushToStore = (modelName, serverModel) => {
      return this.store.push(
        this.store.normalize(modelName, serverModel.toJSON())
      );
    };

    // Server mocks
    this.server.get('/v2/dynamicscans/:id', (schema, req) => {
      return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
    });
  });

  test('checkScanInProgressAndUpdate handles manual scan mode', async function (assert) {
    const service = this.owner.lookup('service:dynamic-scan');

    const oldDynamicscan = this.pushToStore(
      'dynamicscan',
      this.server.create('dynamicscan', {
        id: '9',
        file: '100',
        mode: ENUMS.DYNAMIC_MODE.MANUAL,
      })
    );

    const file = this.pushToStore(
      'file',
      this.server.create('file', {
        id: '100',
        last_manual_dynamic_scan: oldDynamicscan.id,
        last_automated_dynamic_scan: null,
      })
    );

    this.server.create('dynamicscan', {
      id: '10',
      file: file.id,
      mode: ENUMS.DYNAMIC_MODE.MANUAL,
    });

    // Mock file reload method
    let reloadCalled = false;

    file.reload = () => {
      reloadCalled = true;
    };

    // Perform task with manual mode
    await service.checkScanInProgressAndUpdate.perform(
      '10',
      '100',
      ENUMS.DYNAMIC_MODE.MANUAL
    );

    assert.ok(reloadCalled, 'File reload called for manual mode scan');
  });

  test('checkScanInProgressAndUpdate handles automated scan mode', async function (assert) {
    const service = this.owner.lookup('service:dynamic-scan');

    const oldDynamicscan = this.pushToStore(
      'dynamicscan',
      this.server.create('dynamicscan', {
        id: '9',
        file: '100',
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
      })
    );

    const file = this.pushToStore(
      'file',
      this.server.create('file', {
        id: '100',
        last_manual_dynamic_scan: null,
        last_automated_dynamic_scan: oldDynamicscan.id,
      })
    );

    this.server.create('dynamicscan', {
      id: '10',
      file: file.id,
      mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
    });

    // Mock file reload method
    let reloadCalled = false;

    file.reload = () => {
      reloadCalled = true;
    };

    // Perform task with automated mode
    await service.checkScanInProgressAndUpdate.perform(
      '10',
      file.id,
      ENUMS.DYNAMIC_MODE.AUTOMATED
    );

    assert.ok(reloadCalled, 'File reload called for automated mode scan');
  });

  test('checkScanInProgressAndUpdate does not reload file with same scan ID', async function (assert) {
    const service = this.owner.lookup('service:dynamic-scan');

    const dynamicScan = this.pushToStore(
      'dynamicscan',
      this.server.create('dynamicscan', {
        id: '10',
        file: '100',
        mode: ENUMS.DYNAMIC_MODE.MANUAL,
      })
    );

    const file = this.pushToStore(
      'file',
      this.server.create('file', {
        id: '100',
        last_manual_dynamic_scan: dynamicScan.id,
      })
    );

    // Mock file reload method
    let reloadCalled = false;

    file.reload = () => {
      reloadCalled = true;
    };

    // Perform task with same scan ID
    await service.checkScanInProgressAndUpdate.perform(
      dynamicScan.id,
      file.id,
      ENUMS.DYNAMIC_MODE.MANUAL
    );

    assert.notOk(reloadCalled, 'File not reloaded when scan ID is the same');
  });
});
