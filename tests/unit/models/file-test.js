import Ember from 'ember';
import ENUMS from 'irene/enums';
import { moduleForModel, test } from 'ember-qunit';
import localeConfig from 'ember-i18n/config/en';

moduleForModel('file', 'Unit | Model | file', {
  needs: [
    'model:project',
    'model:profile',
    'model:file',
    'model:user',
    'model:analysis',
    'service:i18n',
    'locale:en/translations',
    'locale:en/config',
    'util:i18n/missing-message',
    'util:i18n/compile-template',
    'config:environment'
  ],
  beforeEach() {
    // set the locale and the config
    Ember.getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);
  }
});

test('it passes', function(assert) {
  const file = this.subject();
  Ember.run(function() {
    assert.equal(file.get('ifManualNotRequested'), true, "Manual Requested");

    assert.equal(file.get('isRunningApiScan'), true, "API Scan");
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
    assert.equal(file.get('statusText.string'), "Booting", 'Booting');
    file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.DOWNLOADING);
    assert.equal(file.get('statusText.string'), "Downloading", 'Downloading');
    file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.INSTALLING);
    assert.equal(file.get('statusText.string'), "Installing", 'Installing');
    file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.LAUNCHING);
    assert.equal(file.get('statusText.string'), "Launching", 'Launching');
    file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.HOOKING);
    assert.equal(file.get('statusText.string'), "Starting", 'Hooking');
    file.set('dynamicStatus', ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN);
    assert.equal(file.get('statusText.string'), "Stopping", 'Shutting Down');

    assert.equal(file.setBootingStatus(), undefined, "Set Booting Status");

    assert.equal(file.setShuttingDown(), undefined, "Set Booting Status");

    assert.equal(file.setNone(), undefined, "Set Booting Status");

    assert.equal(file.setReady(), undefined, "Set Booting Status");

  });
});
