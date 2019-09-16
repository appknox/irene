import tHelper from 'ember-intl/helpers/t';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';

moduleForComponent('analysis-settings', 'Integration | Component | analysis settings', {
  unit: true,
  needs: [
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
  run(function() {
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
