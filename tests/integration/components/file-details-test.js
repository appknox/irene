import Ember from 'ember';
import ENUMS from 'irene/enums';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-details', 'Integration | Component | file details', {
  unit: true,
  needs: [
    'service:i18n',
    'helper:vulnerability-type',
    'component:fa-icon',
    'component:file-header',
    'component:analysis-details',
    'component:vnc-viewer',
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
  }
});

test('tapping button fires an external action', function(assert) {
  var component = this.subject();
  this.render();
  Ember.run(function() {
    component.set("file",
      {
        sortedAnalyses: [
          {
            id: 1,
            hasType: false
          },
          {
            id: 2,
            hasType: false
          },
          {
            id: 3,
            hasType: false
          }
        ]
      });
    assert.deepEqual(component.get("analyses"), [{"hasType": false,"id": 1},{"hasType": false,"id": 2},{"hasType": false,"id": 3}] , "Analyses");
    assert.deepEqual(component.get("filteredAnalysis"), [{"hasType": false,"id": 1},{"hasType": false,"id": 2},{"hasType": false,"id": 3}] , "Extra Query Strings");
    component.set("file",
      {
        sortedAnalyses: [
          {
            id: 1,
            hasType() {
              return true;
            }
          },
          {
            id: 2,
            hasType() {
              return true;
            }
          },
          {
            id: 3,
            hasType() {
              return true;
            }
          }
        ]
      });
    component.set("vulnerabilityType", ENUMS.VULNERABILITY_TYPE.STATIC);
    assert.ok(component.get("filteredAnalysis"));
    component.send("filterVulnerabilityType");
  });
});
