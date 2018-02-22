import { moduleForModel, test} from 'ember-qunit';

moduleForModel('collaboration', 'Unit | Model | collaboration', {
  needs: ['model:project', 'model:user', 'model:team']
});

test('it exists', function(assert) {
  const collaboration = this.subject();
  assert.equal(collaboration.get('hasRole'), true, "Has Role");
  collaboration.set('hasRole', false);
  assert.equal(collaboration.get('hasRole'), false, "No role");
  assert.equal(collaboration.get('roleHumanized'), "noPreference", "No Preference");
});
