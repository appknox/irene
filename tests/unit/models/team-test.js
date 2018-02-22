import { moduleForModel, test } from 'ember-qunit';

moduleForModel('team', 'Unit | Model | team', {
  needs: ["model:team", "model:user", "model:collaboration"]
});

test('it exists', function(assert) {
  const team = this.subject();
  assert.equal(team.get('isDefaultTeam'), false, "Default Team");
});
