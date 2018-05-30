import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

moduleForComponent('analysis-settings', 'Integration | Component | analysis settings', {
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

test('tapping button fires an external action', function(assert) {
  var component = this.subject();
  var store = {
    queryRecord: function() {
      return [
        {
          id:1,
          type: "unknown-analysis-status",
          attributes: {
            status: true
          }
        }
      ];
    }
  };
  component.set('store', store);
  this.render();
  Ember.run(function() {
    assert.deepEqual(component.get("unknownAnalysisStatus"), [{
        id:1,
        type: "unknown-analysis-status",
        attributes: {
          status: true
        }
      }
    ]);
    component.set('project', {activeProfileId:1});
    component.send('showUnknownAnalysis');
  });
});
