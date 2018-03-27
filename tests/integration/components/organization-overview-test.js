import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('organization-overview', 'Integration | Component | organization overview', {
  unit: true
});

test('it renders', function(assert) {
  assert.ok(true);
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();

  Ember.run(function() {
    assert.equal(component.get('userClass'),"is-active", "Users");
    component.set("isTeams", true);
    assert.equal(component.get('teamClass'),"is-active", "Teams");
    component.set("isInvitation", true);
    assert.equal(component.get('invitationClass'),"is-active", "Invitations");
    component.send("displayUser");
    component.send("displayTeam");
    component.send("displayInvitation");
    assert.equal(component.get('isUsers'),false, "Users");
    assert.equal(component.get('isTeams'),false, "Teams");
    assert.equal(component.get('isInvitation'),true, "Invitations");

    assert.notOk(component.didInsertElement());

  });
});
