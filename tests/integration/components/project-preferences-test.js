import { getOwner } from '@ember/application';
import ENUMS from 'irene/enums';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';


moduleForComponent('project-preferences', 'Integration | Component | project preferences', {
  unit: true,
  needs: [
    'model:device',
    'helper:device-type',
    'component:modal-card',
    'service:ajax',
    'service:notification-messages-service',
    'service:session',
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

    this.registry.register('helper:t', tHelper);
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
    query: function() {
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
    },
    queryRecord: function() {
      return [
        {
          id:1,
          type: "device-preference",
          attributes: {
            deviceType: 1,
            platformVersion: "7.0"
          }
        }
      ];
    }
  };
  component.set('store', store);
  run(function() {
    component.set("profileId", 1);
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
    assert.deepEqual(component.get("devicePreference"), [{
      "attributes": {
        "deviceType": 1,
        "platformVersion": "7.0"
      },
      "id": 1,
      "type": "device-preference"
      }
    ], 'device preference');
    assert.equal(component.get("isSavingPreference"), true, 'Saving Preference');
    component.set("selectedDeviceType", ENUMS.DEVICE_TYPE.NO_PREFERENCE);
  });
});
