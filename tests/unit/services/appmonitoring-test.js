import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | appmonitoring', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.lastFile = this.server.create('file');
    this.latestAmAppVersion = this.server.create('am-app-version', 1);
    this.amAppSyncs = this.server.createList('am-app-sync', 1);
    this.project = this.server.create('project', {
      lastFile: this.lastFile,
    });
  });

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:appmonitoring');
    assert.ok(service);
  });

  test('it updates limit and offset when the setLimitOffset function is called', function (assert) {
    let service = this.owner.lookup('service:appmonitoring');

    // Default limit and offset value
    assert.strictEqual(service.limit, 10, 'Default limit is 10');
    assert.strictEqual(service.offset, 0, 'Default offset is 0');

    const limit = 20;
    const offset = 40;
    service.setLimitOffset({ limit: limit, offset: offset });

    assert.strictEqual(service.limit, limit, 'Default limit is 10');
    assert.strictEqual(service.offset, offset, 'Default offset is 0');
  });

  test('it fetches and updates app monitoring data when the reload function is called', async function (assert) {
    assert.expect(3);

    this.amApps = this.server.createList('am-app', 3, {
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
    });

    let service = this.owner.lookup('service:appmonitoring');

    const limit = 20;
    const offset = 40;
    service.setLimitOffset({ limit: limit, offset: offset });

    this.server.get('v2/am_apps', (schema, req) => {
      const queryParams = req.queryParams;

      assert.deepEqual(queryParams, {
        limit: String(limit),
        offset: String(offset),
      });

      return schema['amApps'].all().models;
    });

    assert.strictEqual(
      service.appMonitoringData.length,
      0,
      'App monitoring data is empty'
    );

    await service.reload();

    assert.strictEqual(
      service.appMonitoringData.length,
      3,
      'App monitoring data is update'
    );
  });

  test('it fetches app monitoring data with the right limit and offset', async function (assert) {
    assert.expect(3);

    let service = this.owner.lookup('service:appmonitoring');

    this.amApps = this.server.createList('am-app', 3, {
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
    });

    const limit = 2;
    const offset = 3;
    service.setLimitOffset({ limit: limit, offset: offset });

    this.server.get('v2/am_apps', (schema, req) => {
      const queryParams = req.queryParams;

      assert.deepEqual(
        queryParams,
        {
          limit: String(limit),
          offset: String(offset),
        },
        `
        Requset limit = ${limit}; 
        Request offset = ${offset}
      `
      );

      return schema['amApps'].all().models;
    });

    assert.strictEqual(service.limit, limit, `Limit is ${limit}`);
    assert.strictEqual(service.offset, offset, `Offset is ${offset}`);

    await service.reload();
  });

  test('it sets api fetching status correctly', async function (assert) {
    assert.expect(3);

    let service = this.owner.lookup('service:appmonitoring');

    this.amApps = this.server.createList('am-app', 3, {
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
    });

    const limit = 2;
    const offset = 3;
    service.setLimitOffset({ limit: limit, offset: offset });

    this.server.get('v2/am_apps', (schema) => {
      assert.ok(service.isFetchingAMData, 'Monitoring request is in progress.');

      return schema['amApps'].all().models;
    });

    assert.notOk(service.isFetchingAMData, 'Monitoring request is idle.');

    await service.reload();

    assert.notOk(service.isFetchingAMData, 'Monitoring request is idle.');
  });
});
