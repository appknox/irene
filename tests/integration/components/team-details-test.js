import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

moduleForComponent('team-details', 'Integration | Component | team details', {
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
    findAll: function() {
      return [
        {
          id:1,
          type: "invitation",
          attributes: {
            name: "test"
          }
        }
      ];
    }
  };
  component.set('store', store);
  Ember.run(function() {
    assert.notOk(component.get("invitations"));
    component.send('openAddMemberModal');
    component.send('inviteMember');
    component.set("identification", "yash");
    // assert.notOk(component.searchMember());
    component.set("team", {id:1});
    component.send('inviteMember');
    component.set("team", {id:1});
    component.send('addMember');
    assert.equal(component.get('showAddMemberModal'),true, "Open Modal");

  });
});
