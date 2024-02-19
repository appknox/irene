import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | appmonitoring', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const files = this.server.createList('file', 5);

    const projects = files.map((file) =>
      this.server.create('project', { last_file_id: file.id })
    );

    const latestAmAppVersions = files.map((file) =>
      this.server.create('am-app-version', { latest_file: file.id })
    );

    const amApps = projects.map((project, idx) => {
      const amApp = this.server.create('am-app', {
        project: project.id,
        latest_am_app_version: latestAmAppVersions[idx].id,
      });

      const normalized = store.normalize('am-app', amApp.toJSON());

      return store.push(normalized);
    });

    this.setProperties({
      amApps,
    });
  });

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:appmonitoring');
    assert.ok(service);
  });

  test('it updates limit and offset when the setLimitOffset function is called', function (assert) {
    const service = this.owner.lookup('service:appmonitoring');

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
    assert.expect(8);

    const service = this.owner.lookup('service:appmonitoring');

    const limit = 20;
    const offset = 40;

    service.setLimitOffset({ limit: limit, offset: offset });

    this.server.get('/v2/am_apps', (schema, req) => {
      const queryParams = req.queryParams;

      assert.deepEqual(queryParams, {
        limit: String(limit),
        offset: String(offset),
        q: '',
      });

      const results = schema.amApps.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    assert.notOk(service.appMonitoringData, 'App monitoring data is empty');

    await service.reload();

    assert.strictEqual(
      service.appMonitoringData.length,
      this.amApps.length,
      'App monitoring data is updated'
    );

    // Sanity check for amApp records

    for (let index = 0; index < service.appMonitoringData.length; index++) {
      const serviceAmApp = service.appMonitoringData.objectAt(index);
      const amApp = this.amApps[index];

      assert.strictEqual(serviceAmApp.id, amApp.id);
    }
  });

  test('it fetches app monitoring data with the right limit and offset', async function (assert) {
    assert.expect(3);

    const service = this.owner.lookup('service:appmonitoring');

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
          q: '',
        },
        `
        Requset limit = ${limit}; 
        Request offset = ${offset}
      `
      );

      const results = schema.amApps.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    assert.strictEqual(service.limit, limit, `Limit is ${limit}`);
    assert.strictEqual(service.offset, offset, `Offset is ${offset}`);

    await service.reload();
  });

  test('it sets api fetching status correctly', async function (assert) {
    assert.expect(3);

    const service = this.owner.lookup('service:appmonitoring');

    const limit = 2;
    const offset = 3;

    service.setLimitOffset({ limit: limit, offset: offset });

    this.server.get('/v2/am_apps', (schema) => {
      assert.ok(service.isFetchingAMData, 'Monitoring request is in progress.');

      const results = schema.amApps.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    assert.notOk(service.isFetchingAMData, 'Monitoring request is idle.');

    await service.reload();

    assert.notOk(service.isFetchingAMData, 'Monitoring request is idle.');
  });
});
