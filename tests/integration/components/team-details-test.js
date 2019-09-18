import { getOwner } from '@ember/application';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';


moduleForComponent('team-details', 'Integration | Component | team details', {
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

    this.registry.register('helper:t', tHelper);
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
  run(function() {
    assert.notOk(component.get("invitations"));
    component.send('openAddMemberModal');
    component.send('inviteMember');
    component.set("identification", "yash");
    // assert.notOk(component.searchMember());
    component.set("team", {id:1});
    component.send('inviteMember');
    component.set("team", {teamId:1});
    component.set("organization", {id:1});
    component.send('addMember');
    assert.equal(component.get('showAddMemberModal'),true, "Open Modal");

  });
});
