import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

moduleForComponent('collaboration-component', 'Integration | Component | collaboration component', {
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
    query: function() {
      return [
        {
          id:1,
          type: "collaboration",
          attributes: {
            name: "test"
          }
        }
      ];
    },
    findAll: function() {
      return [
        {
          id:1,
          type: "team",
          attributes: {
            name: "test"
          }
        }
      ];
    }
  };
  component.set('store', store);
  Ember.run(function() {
    assert.deepEqual(component.get("collaborations"), [{
        id:1,
        type: "collaboration",
        attributes: {
          name: "test"
        }
      }
    ]);
    assert.deepEqual(component.get("teams"), [{
        id:1,
        type: "team",
        attributes: {
          name: "test"
        }
      }
    ]);
    component.send('openCollaborationModal');
    component.send('closeModal');
    assert.equal(component.get("showCollaborationModal"), false, 'Show Modal');
    component.send("addCollaboration");

    component.set("selectedTeam", "test");
    component.send("addCollaboration");
  });
});
