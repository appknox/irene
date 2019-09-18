import tHelper from 'ember-intl/helpers/t';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';

moduleForComponent('api-filter', 'Integration | Component | api filter', {
  unit: true,
  needs: [
    'service:ajax',
    'component:confirm-box',
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
          type: "api-scan-options",
          attributes: {
            apiUrlFilters: "test"
          }
        }
      ];
    }
  };
  component.set('store', store);
  this.render();
  run(function() {
    assert.deepEqual(component.get("apiScanOptions"), [{
        id:1,
        type: "api-scan-options",
        attributes: {
          apiUrlFilters: "test"
        }
      }
    ]);
    component.set('project', {id: 1, activeProfileId:1});
    component.set('profileId', 1);
    component.set('apiScanOptions', {id: 1, apiUrlFilters:"yash.com", activeProfileId:1});
    assert.equal(component.confirmCallback() ,undefined, "Show Vulnerability");
    component.set("isSavingFilter", true);
    component.send("addApiUrlFilter");
    component.set("newUrlFilter", "test1.com:8000");
    component.send("addApiUrlFilter");
    component.set("newUrlFilter", "test1.com");
    component.send("addApiUrlFilter");
    component.set('project', {id: 1, apiUrlFilters:"", activeProfileId:1});
    component.send("addApiUrlFilter");
    component.send("closeRemoveURLConfirmBox");
  });
});
