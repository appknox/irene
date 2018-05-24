import Ember from 'ember';
import ENUMS from 'irene/enums';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

moduleForComponent('project-preferences', 'Integration | Component | project preferences', {
  unit: true,
  needs: [
    'model:device',
    'service:i18n',
    'helper:device-type',
    'component:modal-card',
    'service:ajax',
    'service:notification-messages-service',
    'service:session',
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

    // register t helper
    this.register('helper:t', tHelper);

    // start Mirage
    this.server = startMirage();
  },
  afterEach() {
    // shutdown Mirage
    this.server.shutdown();
  }
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  var store = {
    findAll: function() {
      return [
        {
          id:1,
          type: "device",
          attributes: {
            name: "test",
            platform: 1
          }
        }
      ];
    }
  };
  component.set('store', store);

  Ember.run(function() {
    component.set("project", {activeProfileId:1});
    component.send('versionSelected');

    assert.deepEqual(component.get("devices"), [{
      "attributes": {
        "name": "test",
        "platform": 1
      },
      "id": 1,
      "type": "device"
      }
    ], 'devices');

    assert.equal(component.get("isSavingPreference"), true, 'Saving Preference');



    component.send('openProjectPreferenceModal');
    assert.equal(component.get("projectPreferenceModal"), true, 'Open Modal');
    component.send('closeProjectPreferenceModal');
    assert.equal(component.get("projectPreferenceModal"), false, 'Close Modal');

    component.set("selectedDeviceType", ENUMS.DEVICE_TYPE.NO_PREFERENCE);

  });
});
