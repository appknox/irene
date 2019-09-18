import { getOwner } from '@ember/application';
import ENUMS from 'irene/enums';
import { moduleForModel, test } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForModel('file', 'Unit | Model | file', {
  needs: [
    'model:project',
    'model:profile',
    'model:organization-project',
    'model:file',
    'model:user',
    'model:analysis',
    'config:environment',
    'service:intl',
    'ember-intl@adapter:default',
    'cldr:en',
    'cldr:ja',
    'translation:en',
    'util:intl/missing-message'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:intl').setLocale('en');
  }
});

test('it passes', function(assert) {
  run(() => {
    const file = getOwner(this).lookup(
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
