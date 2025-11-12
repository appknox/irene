import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';

module('Unit | Service | websocket', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:websocket');
    assert.ok(service);
  });

  test('getHost returns websocket from configuration', function (assert) {
    const service = this.owner.lookup('service:websocket');

    service.configuration.serverData = { websocket: 'wss://example.com' };

    assert.strictEqual(service.getHost(), 'wss://example.com');
  });

  test('getHost returns ajax host as fallback', function (assert) {
    const service = this.owner.lookup('service:websocket');

    service.configuration.serverData = {};
    service.ajax.host = 'https://api.example.com';

    assert.strictEqual(service.getHost(), 'https://api.example.com');
  });

  test('getHost returns / as default fallback', function (assert) {
    const service = this.owner.lookup('service:websocket');

    service.configuration.serverData = {};
    service.ajax.host = null;

    assert.strictEqual(service.getHost(), '/');
  });

  test('configure does nothing if user is null', async function (assert) {
    const service = this.owner.lookup('service:websocket');

    await service.configure(null);

    assert.strictEqual(service.currentSocketID, null);
    assert.strictEqual(service.currentUser, null);
  });

  test('configure does nothing if user has no socketId', async function (assert) {
    const service = this.owner.lookup('service:websocket');
    const user = { socketId: null };

    await service.configure(user);

    assert.strictEqual(service.currentSocketID, null);
    assert.strictEqual(service.currentUser, null);
  });

  test('configure sets up socket connection', async function (assert) {
    const service = this.owner.lookup('service:websocket');
    const user = { socketId: 'test-socket-123' };

    // Mock socket instance
    let connectCalled = false;

    service._initializeSocket = () => {
      connectCalled = true;
    };

    await service.configure(user);

    assert.strictEqual(service.currentSocketID, 'test-socket-123');
    assert.strictEqual(service.currentUser, user);
    assert.true(connectCalled);
  });

  test('onConnect emits subscribe with current socket ID', function (assert) {
    const service = this.owner.lookup('service:websocket');
    service.currentSocketID = 'room-123';

    let emittedData = null;

    service.connectedSocket = {
      emit: (event, data) => {
        emittedData = { event, data };
      },
      on: () => {},
      off: () => {},
      reconnect: () => {},
      close: () => {},
    };

    service.onConnect();

    assert.strictEqual(emittedData.event, 'subscribe');
    assert.strictEqual(emittedData.data.room, 'room-123');
  });

  test('onModelNotification pushes model to store', function (assert) {
    const service = this.owner.lookup('service:websocket');
    const store = this.owner.lookup('service:store');

    let normalizedData = null;
    let pushedData = null;

    store.normalize = (modelName, data) => {
      normalizedData = { modelName, data };
      return { data: { id: '1', type: modelName, attributes: data } };
    };

    store.push = (data) => {
      pushedData = data;
    };

    service.onModelNotification({
      model_name: 'file',
      data: { id: '1', name: 'test.apk' },
    });

    assert.strictEqual(normalizedData.modelName, 'file');
    assert.strictEqual(normalizedData.data.id, '1');
    assert.ok(pushedData);
  });

  test('onModelNotification logs error for invalid data', function (assert) {
    const service = this.owner.lookup('service:websocket');
    let errorLogged = false;

    service.logger.error = () => {
      errorLogged = true;
    };

    service.onModelNotification(null);

    assert.true(errorLogged);
  });

  test('onObject triggers enqueuePullModel', function (assert) {
    const service = this.owner.lookup('service:websocket');

    let performCalled = false;
    let performArgs = null;

    service.enqueuePullModel = {
      perform: (...args) => {
        performCalled = true;
        performArgs = args;
      },
    };

    service.onObject({ id: '123', type: 'files' });

    assert.true(performCalled);
    assert.strictEqual(performArgs[0], 'file'); // singularized
    assert.strictEqual(performArgs[1], '123');
  });

  test('onObject logs error for missing id or type', function (assert) {
    const service = this.owner.lookup('service:websocket');
    let errorCount = 0;

    service.logger.error = () => {
      errorCount++;
    };

    service.onObject({ id: '123' });
    service.onObject({ type: 'files' });
    service.onObject(null);

    assert.strictEqual(errorCount, 3);
  });

  test('onNotification updates ak-notifications', function (assert) {
    assert.expect(1);

    const service = this.owner.lookup('service:websocket');
    let updateData = null;

    const mockAkNotifications = {
      realtimeUpdate(data) {
        updateData = data;
      },
    };

    this.owner.register('service:ak-notifications', mockAkNotifications, {
      instantiate: false,
    });

    service.akNotifications = mockAkNotifications;

    service.onNotification({
      unread_count: 5,
      product: ENUMS.NOTIF_PRODUCT.APPKNOX,
    });

    assert.strictEqual(updateData.unReadCount, 5);
  });

  test('onNotification updates sk-notifications', function (assert) {
    const service = this.owner.lookup('service:websocket');

    let updateData = null;

    const mockSkNotifications = {
      realtimeUpdate(data) {
        updateData = data;
      },
    };

    this.owner.register('service:sk-notifications', mockSkNotifications, {
      instantiate: false,
    });

    service.skNotifications = mockSkNotifications;

    service.onNotification({
      unread_count: 3,
      product: ENUMS.NOTIF_PRODUCT.STOREKNOX,
    });

    assert.strictEqual(updateData.unReadCount, 3);
  });

  test('onNotification logs error for invalid data', function (assert) {
    const service = this.owner.lookup('service:websocket');

    let errorCount = 0;

    service.logger.error = () => {
      errorCount++;
    };

    service.onNotification(null);
    service.onNotification({});

    assert.strictEqual(errorCount, 2);
  });

  test('onMessage handles INFO notification', function (assert) {
    assert.expect(3);

    const service = this.owner.lookup('service:websocket');
    let notificationCalled = false;

    service.notifications.info = (message, config) => {
      notificationCalled = true;

      assert.strictEqual(message, 'Test info message');
      assert.strictEqual(config, ENV.notifications);
    };

    service.onMessage({
      message: 'Test info message',
      notifyType: ENUMS.NOTIFY.INFO,
    });

    assert.true(notificationCalled);
  });

  test('onMessage handles SUCCESS notification', function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:websocket');
    let notificationCalled = false;

    service.notifications.success = (message) => {
      notificationCalled = true;

      assert.strictEqual(message, 'Test success');
    };

    service.onMessage({
      message: 'Test success',
      notifyType: ENUMS.NOTIFY.SUCCESS,
    });

    assert.true(notificationCalled);
  });

  test('onMessage handles WARNING notification', function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:websocket');
    let notificationCalled = false;

    service.notifications.warning = (message) => {
      notificationCalled = true;

      assert.strictEqual(message, 'Test warning');
    };

    service.onMessage({
      message: 'Test warning',
      notifyType: ENUMS.NOTIFY.WARNING,
    });

    assert.true(notificationCalled);
  });

  test('onMessage handles ALERT notification', function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:websocket');
    let notificationCalled = false;

    service.notifications.alert = (message) => {
      notificationCalled = true;

      assert.strictEqual(message, 'Test alert');
    };

    service.onMessage({
      message: 'Test alert',
      notifyType: ENUMS.NOTIFY.ALERT,
    });

    assert.true(notificationCalled);
  });

  test('onMessage handles ERROR notification', function (assert) {
    assert.expect(3);

    const service = this.owner.lookup('service:websocket');

    let notificationCalled = false;
    let configPassed = null;

    service.notifications.error = (message, config) => {
      notificationCalled = true;
      configPassed = config;

      assert.strictEqual(message, 'Test error');
    };

    service.onMessage({
      message: 'Test error',
      notifyType: ENUMS.NOTIFY.ERROR,
    });

    assert.true(notificationCalled);
    assert.false(configPassed.autoClear);
  });

  test('onMessage logs error for invalid data', function (assert) {
    const service = this.owner.lookup('service:websocket');
    let errorCount = 0;

    service.logger.error = () => {
      errorCount++;
    };

    service.onMessage(null);
    service.onMessage({ message: 'test' });
    service.onMessage({ notifyType: 1 });

    assert.strictEqual(errorCount, 3);
  });

  test('onCounter increments realtime property', function (assert) {
    const service = this.owner.lookup('service:websocket');
    let incrementedProperty = null;

    service.realtime.incrementProperty = (property) => {
      incrementedProperty = property;
    };

    service.onCounter({ type: 'vulnerability' });

    assert.strictEqual(incrementedProperty, 'vulnerabilityCounter');
  });

  test('onCounter logs error for invalid data', function (assert) {
    const service = this.owner.lookup('service:websocket');
    let errorCount = 0;

    service.logger.error = () => {
      errorCount++;
    };

    service.onCounter(null);
    service.onCounter({});

    assert.strictEqual(errorCount, 2);
  });

  test('enqueuePullModel stores unique models', async function (assert) {
    const service = this.owner.lookup('service:websocket');

    await service.enqueuePullModel.perform('file', '1');
    await service.enqueuePullModel.perform('file', '2');
    await service.enqueuePullModel.perform('file', '1'); // Duplicate
    await service.enqueuePullModel.perform('file', '1'); // Duplicate
    await service.enqueuePullModel.perform('file', '1'); // Duplicate

    const keys = Object.keys(service.modelNameIdMapper);

    assert.strictEqual(keys.length, 2);
    assert.ok(service.modelNameIdMapper['file-1']);
    assert.ok(service.modelNameIdMapper['file-2']);
  });

  test('handlePullModel resets mapper and pulls models', function (assert) {
    const service = this.owner.lookup('service:websocket');

    const mapper = {
      'file-1': { modelName: 'file', id: '1' },
      'file-2': { modelName: 'file', id: '2' },
    };

    let pullCalls = [];

    service.pullModel = {
      perform: (modelName, id) => {
        pullCalls.push({ modelName, id });
      },
    };

    service.modelNameIdMapper = { ...mapper };
    service.handlePullModel(mapper);

    assert.strictEqual(Object.keys(service.modelNameIdMapper).length, 0);
    assert.strictEqual(pullCalls.length, 2);
    assert.deepEqual(pullCalls[0], { modelName: 'file', id: '1' });
    assert.deepEqual(pullCalls[1], { modelName: 'file', id: '2' });
  });

  test('pullModel fetches record from store', async function (assert) {
    assert.expect(6);

    const service = this.owner.lookup('service:websocket');
    const store = this.owner.lookup('service:store');

    this.server.create('file', { id: '1' });

    let modelForCalled = false;
    let findRecordCalled = false;

    const originalModelFor = store.modelFor;
    const originalFindRecord = store.findRecord;

    store.modelFor = function (modelName) {
      modelForCalled = true;

      assert.strictEqual(modelName, 'file');
      return originalModelFor.call(store, modelName);
    };

    store.findRecord = async function (modelName, id) {
      findRecordCalled = true;

      assert.strictEqual(modelName, 'file');
      assert.strictEqual(id, '1');

      return originalFindRecord.call(store, modelName, id);
    };

    await service.pullModel.perform('file', '1');

    assert.true(modelForCalled);
    assert.true(findRecordCalled);
  });

  test('pullModel handles errors gracefully', async function (assert) {
    const service = this.owner.lookup('service:websocket');
    const store = this.owner.lookup('service:store');

    let errorLogged = false;

    service.logger.error = () => {
      errorLogged = true;
    };

    store.findRecord = async () => {
      throw new Error('Network error');
    };

    await service.pullModel.perform('file', 'non-existent');

    assert.true(errorLogged);
  });

  test('closeSocketConnection closes socket for host', function (assert) {
    const service = this.owner.lookup('service:websocket');
    let closedHost = null;

    service.socketIOService = {
      closeSocketFor: (host) => {
        closedHost = host;
      },
    };

    service.configuration.serverData = { websocket: 'wss://test.com' };
    service.closeSocketConnection();

    assert.strictEqual(closedHost, 'wss://test.com');
  });

  test('onNewObject calls onObject', function (assert) {
    const service = this.owner.lookup('service:websocket');

    let onObjectCalled = false;
    let onObjectArgs = null;

    service.onObject = (...args) => {
      onObjectCalled = true;
      onObjectArgs = args;
    };

    service.onNewObject({ id: '123', type: 'files' });

    assert.true(onObjectCalled);
    assert.strictEqual(onObjectArgs[0].id, '123');
    assert.strictEqual(onObjectArgs[0].type, 'files');
  });
});
