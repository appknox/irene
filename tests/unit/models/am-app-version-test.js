import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import ENUMS from 'irene/enums';

module('Unit | Model | am app version', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('am-app-version', {});
    assert.ok(model);
  });

  test('it should give comparableVersion as versionCode for platform android', function (assert) {
    const store = this.owner.lookup('service:store');
    const androidProject = store.createRecord('project', {
      platform: ENUMS.PLATFORM.ANDROID,
    });
    const androidAMApp = store.createRecord('am-app', {
      project: androidProject,
    });

    const androidAmAppVersion = store.createRecord('am-app-version', {
      amApp: androidAMApp,
      version: '2.3.0',
      versionCode: '64',
    });
    assert.strictEqual(androidAmAppVersion.comparableVersion, '64');
  });

  test('it should give comparableVersion as versionCode for platform ios', function (assert) {
    const store = this.owner.lookup('service:store');

    const iosProject = store.createRecord('project', {
      platform: ENUMS.PLATFORM.IOS,
    });
    const iosAMApp = store.createRecord('am-app', {
      project: iosProject,
    });

    const iosAmAppVersion = store.createRecord('am-app-version', {
      amApp: iosAMApp,
      version: '2.3.0',
      versionCode: '64',
    });
    assert.strictEqual(iosAmAppVersion.comparableVersion, '2.3.0');
  });

  test('it should give comparableVersion as versionCode for platform null', function (assert) {
    const store = this.owner.lookup('service:store');

    const nullProject = store.createRecord('project', { platform: null });
    const nullAMApp = store.createRecord('am-app', {
      project: nullProject,
    });

    const nullAmAppVersion = store.createRecord('am-app-version', {
      amApp: nullAMApp,
      version: '2.3.0',
      versionCode: '64',
    });
    assert.strictEqual(nullAmAppVersion.comparableVersion, '64');
  });
});
