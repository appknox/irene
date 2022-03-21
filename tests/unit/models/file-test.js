/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal, qunit/no-assert-equal-boolean */
import ENUMS from 'irene/enums';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | file', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
  });

  test('it passes', function(assert) {
    run(() => {
      const file = this.owner.lookup(
        'service:store'
      ).createRecord('file', {
        'id': 1
      });
      assert.equal(file.get('isManualRequested'), true, "Manual Requested");

      assert.equal(file.get('isRunningApiScan'), false, "API Scan");
      file.set('apiScanProgress', 100);
      assert.equal(file.get('isRunningApiScan'), false, "API Scan not done");

      assert.equal(file.scanProgressClass(), false, "Scan Progress Class");
      assert.equal(file.scanProgressClass(true), true, "Scan Progress Class");

      assert.equal(file.get('isStaticCompleted'), false, "Static Scan");

      assert.equal(file.get('isNoneStatus'), false, "None Status");

      assert.equal(file.get('isReady'), false, "Is Ready");

      assert.equal(file.get('isNeitherNoneNorReady'), true, "Is Not None Nor Ready");

      assert.equal(file.get('statusText'), "Unknown Status", 'Unknown Status');
      file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.BOOTING);
      assert.equal(file.get('statusText'), "Booting", 'Booting');
      file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.DOWNLOADING);
      assert.equal(file.get('statusText'), "Downloading", 'Downloading');
      file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.INSTALLING);
      assert.equal(file.get('statusText'), "Installing", 'Installing');
      file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.LAUNCHING);
      assert.equal(file.get('statusText'), "Launching", 'Launching');
      file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.HOOKING);
      assert.equal(file.get('statusText'), "Starting", 'Hooking');
      file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN);
      assert.equal(file.get('statusText'), "Stopping", 'Shutting Down');

      assert.equal(file.setBootingStatus(), undefined, "Set Booting Status");

      assert.equal(file.setShuttingDown(), undefined, "Set Booting Status");

      assert.equal(file.setNone(), undefined, "Set Booting Status");

      assert.equal(file.setReady(), undefined, "Set Booting Status");

    });
  });
});
