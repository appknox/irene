import tHelper from 'ember-intl/helpers/t';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | analysis settings', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');

    // register t helper
    this.owner.register('helper:t', tHelper);

    // start Mirage
    this.server = startMirage();
  });

  hooks.afterEach(function() {
    // shutdown Mirage
    this.server.shutdown();
  });

  test('tapping button fires an external action', function(assert) {
    var component = this.owner.factoryFor('component:analysis-settings').create();
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
});
