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
  });

  test('checkScanInProgressAndUpdate does nothing for non-DynamicscanModel', async function (assert) {
    const service = this.owner.lookup('service:dynamic-scan');

    const file = this.pushToStore(
      'file',
      this.server.create('file', { id: '100' })
    );

    // Mock router and current file
    service.router = {
      currentRouteName: 'authenticated.dashboard.file.dynamic-scan',
    };

    service.currentFile = file;

    // Initial state
    service.manualScan = null;
    service.automatedScan = null;

    // Perform task with non-model input
    await service.checkScanInProgressAndUpdate.perform(file);

    assert.ok(true, 'No error thrown');

    assert.strictEqual(service.manualScan, null, 'Manual scan remains null');

    assert.strictEqual(
      service.automatedScan,
      null,
      'Automated scan remains null'
    );
  });

  test('checkScanInProgressAndUpdate does nothing when not on dynamic scan route', async function (assert) {
    const service = this.owner.lookup('service:dynamic-scan');

    const file = this.pushToStore(
      'file',
      this.server.create('file', { id: '100' })
    );

    // Mock router with wrong route
    service.router = { currentRouteName: 'some.other.route' };
    service.currentFile = file;

    const dynamicScan = this.pushToStore(
      'dynamicscan',
      this.server.create('dynamicscan', {
        file: file.id,
        mode: ENUMS.DYNAMIC_MODE.MANUAL,
      })
    );

    // Initial state
    service.manualScan = null;
    service.automatedScan = null;

    // Perform task
    await service.checkScanInProgressAndUpdate.perform(dynamicScan);

    assert.strictEqual(service.manualScan, null, 'Manual scan remains null');

    assert.strictEqual(
      service.automatedScan,
      null,
      'Automated scan remains null'
    );
  });

  test('checkScanInProgressAndUpdate does nothing when file does not match', async function (assert) {
    const service = this.owner.lookup('service:dynamic-scan');

    const currentFile = this.pushToStore(
      'file',
      this.server.create('file', { id: '200' })
    );

    // Mock router and current file
    service.router = {
      currentRouteName: 'authenticated.dashboard.file.dynamic-scan',
    };

    service.currentFile = currentFile;

    const differentFile = this.pushToStore(
      'file',
      this.server.create('file', { id: '100' })
    );

    const dynamicScan = this.pushToStore(
      'dynamicscan',
      this.server.create('dynamicscan', {
        file: differentFile.id,
        mode: ENUMS.DYNAMIC_MODE.MANUAL,
      })
    );

    // Initial state
    service.manualScan = null;
    service.automatedScan = null;

    // Perform task
    await service.checkScanInProgressAndUpdate.perform(dynamicScan);

    assert.strictEqual(service.manualScan, null, 'Manual scan remains null');

    assert.strictEqual(
      service.automatedScan,
      null,
      'Automated scan remains null'
    );
  });

  test('checkScanInProgressAndUpdate updates manual scan', async function (assert) {
    const service = this.owner.lookup('service:dynamic-scan');

    service.router = {
      currentRouteName: 'authenticated.dashboard.file.dynamic-scan',
    };

    const file = this.pushToStore(
      'file',
      this.server.create('file', { id: '100' })
    );

    service.currentFile = file;

    const dynamicScan = this.pushToStore(
      'dynamicscan',
      this.server.create('dynamicscan', {
        id: '200',
        file: file.id,
        mode: ENUMS.DYNAMIC_MODE.MANUAL,
      })
    );

    // Initial state
    service.manualScan = null;

    // Perform task
    await service.checkScanInProgressAndUpdate.perform(dynamicScan);

    assert.strictEqual(
      service.manualScan.id,
      dynamicScan.id,
      'Manual scan updated'
    );
  });

  test('checkScanInProgressAndUpdate updates automated scan', async function (assert) {
    const service = this.owner.lookup('service:dynamic-scan');

    service.router = {
      currentRouteName: 'authenticated.dashboard.file.dynamic-scan',
    };

    const file = this.pushToStore(
      'file',
      this.server.create('file', { id: '100' })
    );

    service.currentFile = file;

    const dynamicScan = this.pushToStore(
      'dynamicscan',
      this.server.create('dynamicscan', {
        id: '200',
        file: file.id,
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
      })
    );

    // Initial state
    service.automatedScan = null;

    // Perform task
    await service.checkScanInProgressAndUpdate.perform(dynamicScan);

    assert.strictEqual(
      service.automatedScan.id,
      dynamicScan.id,
      'Automated scan updated'
    );
  });

  test('checkScanInProgressAndUpdate does not update scan with same ID', async function (assert) {
    const service = this.owner.lookup('service:dynamic-scan');

    service.router = {
      currentRouteName: 'authenticated.dashboard.file.dynamic-scan',
    };

    const file = this.pushToStore(
      'file',
      this.server.create('file', { id: '100' })
    );

    service.currentFile = file;

    const initialDynamicScan = this.pushToStore(
      'dynamicscan',
      this.server.create('dynamicscan', {
        id: '200',
        file: file.id,
        mode: ENUMS.DYNAMIC_MODE.MANUAL,
      })
    );

    const duplicateDynamicScan = this.pushToStore(
      'dynamicscan',
      this.server.create('dynamicscan', {
        id: '200',
        file: file.id,
        mode: ENUMS.DYNAMIC_MODE.MANUAL,
      })
    );

    // Initial state
    service.manualScan = initialDynamicScan;

    // Perform task
    await service.checkScanInProgressAndUpdate.perform(duplicateDynamicScan);

    assert.strictEqual(
      service.manualScan.id,
      initialDynamicScan.id,
      'Scan not updated when ID is the same'
    );
  });
});
