import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';


module('Integration | Component | team details', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');

    this.owner.register('helper:t', tHelper);
    // start Mirage
    this.server = startMirage();
  });

  hooks.afterEach(function() {
    // shutdown Mirage
    this.server.shutdown();
  });

  test('tapping button fires an external action', function(assert) {
    var component = this.owner.factoryFor('component:team-details').create();
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
});
