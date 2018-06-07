import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

moduleForComponent('api-filter', 'Integration | Component | api filter', {
  unit: true,
  needs: [
    'service:i18n',
    'service:ajax',
    'component:confirm-box',
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
  Ember.run(function() {
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
