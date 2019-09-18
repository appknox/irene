import { getOwner } from '@ember/application';
import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';

moduleForComponent('file-details', 'Integration | Component | file details', {
  unit: true,
  needs: [
    'service:session',
    'service:ajax',
    'service:trial',
    'service:organization',
    'service:notification-messages-service',
    'helper:vulnerability-type',
    'component:file-header',
    'component:analysis-details',
    'component:vnc-viewer',
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

  }
});

test('tapping button fires an external action', function (assert) {
  var component = this.subject();
  this.render();
  run(function () {
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
    assert.deepEqual(component.get("analyses"), [{ "hasType": false, "id": 1 }, { "hasType": false, "id": 2 }, { "hasType": false, "id": 3 }], "Analyses");

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
    component.send("filterVulnerabilityType");
  });
});
