import { moduleForModel, test} from 'ember-qunit';
import ENUMS from 'irene/enums';
import Ember from 'ember';


moduleForModel('collaboration', 'Unit | Model | collaboration', {
  needs: ['model:project', 'model:user', 'model:team']
});

test('it exists', function(assert) {
  const collaboration = this.subject();
  assert.equal(collaboration.get('hasRole'), true, "Has Role");
  Ember.run(function() {
    collaboration.set('role', ENUMS.COLLABORATION_ROLE.UNKNOWN);
  });
  assert.equal(collaboration.get('hasRole'), false, "No role");
  assert.equal(collaboration.get('roleHumanized'), "noPreference", "No Preference");
});
