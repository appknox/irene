import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-header', 'Integration | Component | file header', {
  unit: true,
  needs: [
    'service:i18n',
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

test('it exists', function(assert) {
  const component = this.subject();
  var store = {
    findRecord: function() {
      return [
        {
          id:1,
          type: "manualscan",
          attributes: {
            name: "test"
          }
        }
      ];
    }
  };
  component.set('store', store);
  assert.deepEqual(component.get("manualscan"), [{
      id:1,
      type: "manualscan",
      attributes: {
        name: "test"
      }
    }
  ]);
  assert.deepEqual(component.get('filteredEnvironments'), [{"key": "NO_PREFERENCE","value": 0},{"key": "STAGING","value": 1},{"key": "PRODUCTION","value": 2}], "ENVS");
  assert.deepEqual(component.get('filteredAppActions'), [{"key": "NO_PREFERENCE","value": 0},{"key": "HALT","value": 1},{"key": "PROCEED","value": 2}], "ACTIONS");
  assert.deepEqual(component.get('filteredLoginStatuses'), ["yes", "no"], "LOGIN");
  assert.deepEqual(component.get('filteredVpnStatuses'), ["yes", "no"], "VPN");
  assert.deepEqual(component.get('chartOptions'),{ "animation": { "animateRotate": false }, "legend": { "display": false } }, "Chart Options");
  assert.equal(component.didInsertElement(), undefined, "Register Password Copy");
  assert.equal(component.willDestroyElement(), undefined, "Remove Password Copy");
  component.set("manualscan",
    {
      userRoles: [
        {
          id: 'a'
        },
        {
          id: 'b'
        },
        {
          id: 'c'
        },
      ]
    });
  assert.deepEqual(component.get("allUserRoles"), [{"id": 1},{"id": 2},{"id": 3}], "User Roles");
  assert.equal(component.confirmCallback(), undefined, "User Roles");
});
