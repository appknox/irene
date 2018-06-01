import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

moduleForComponent('report-preferences', 'Integration | Component | report preferences', {
  unit: true,
  needs: [
    'service:i18n',
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

test('it exists', function(assert) {
  const component = this.subject();
  var store = {
    queryRecord: function() {
      return [
        {
          id:1,
          type: "report-preference",
          attributes: {
            deviceType: 1,
            platformVersion: "8.2"
          }
        }
      ];
    }
  };
  component.set('store', store);
  this.render();
  Ember.run(function() {
    assert.deepEqual(component.get("reportPreference"), [{
        id:1,
        type: "report-preference",
        attributes: {
          deviceType: 1,
          platformVersion: "8.2"
        }
      }
    ]);
    component.set("project", {activeProfileId:1});
    component.send("showIgnoredAnalysis");
  });
});
