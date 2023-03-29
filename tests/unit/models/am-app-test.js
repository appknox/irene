import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | am app', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('am-app', {});
    assert.ok(model);
  });

  test('isPending should be true if lastSync is null', function (assert) {
    const store = this.owner.lookup('service:store');
    const am_app1 = store.createRecord('am-app', { lastSync: null });
    assert.true(am_app1.isPending);

    const am_app_sync = store.createRecord('am-app-sync', { id: 1 });
    const am_app2 = store.createRecord('am-app', { lastSync: am_app_sync });
    assert.false(am_app2.isPending);
  });

  test('hasRelevantAmAppVersion should be true if relevantAmAppVersion is not null', function (assert) {
    const store = this.owner.lookup('service:store');
    const am_app_version = store.createRecord('am-app-version', { id: 1 });
    const am_app1 = store.createRecord('am-app', {
      relevantAmAppVersion: am_app_version,
    });
    assert.true(am_app1.hasRelevantAmAppVersion);

    const am_app2 = store.createRecord('am-app', {
      relevantAmAppVersion: null,
    });
    assert.false(am_app2.hasRelevantAmAppVersion);
  });

  test('isNotFound should be true if not pending and relevantAmAppVersion is null', function (assert) {
    const store = this.owner.lookup('service:store');
    const am_app_version = store.createRecord('am-app-version', { id: 21 });
    const am_app_sync = store.createRecord('am-app-sync', { id: 11 });
    const mapping = [
      {
        lastSync: am_app_sync,
        relevantAmAppVersion: am_app_version,
        isNotFound: false,
      },
      {
        lastSync: null,
        relevantAmAppVersion: am_app_version,
        isNotFound: false,
      },
      {
        lastSync: am_app_sync,
        relevantAmAppVersion: null,
        isNotFound: true,
      },
      {
        lastSync: null,
        relevantAmAppVersion: null,
        isNotFound: false,
      },
    ];
    assert.expect(4);
    for (let obj of mapping) {
      const am_app = store.createRecord('am-app', {
        relevantAmAppVersion: obj.relevantAmAppVersion,
        lastSync: obj.lastSync,
      });
      const msg = `isNotFound(${
        obj.isNotFound
      }):hasRelevantAmAppVersion(${!!obj.hasRelevantAmAppVersion}):lastSync(${!!obj.lastSync})`;
      assert.strictEqual(obj.isNotFound, am_app.isNotFound, msg);
    }
  });
});
