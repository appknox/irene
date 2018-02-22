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
    assert.equal(collaboration.get('hasRole'), false, "No role");
  });
  Ember.run(function() {
    assert.equal(collaboration.get('roleHumanized'), "noPreference", "No Preference");
    collaboration.set('role', ENUMS.COLLABORATION_ROLE.ADMIN);
    assert.equal(collaboration.get('roleHumanized'), "admin", "Admin");
    collaboration.set('role', ENUMS.COLLABORATION_ROLE.MANAGER);
    assert.equal(collaboration.get('roleHumanized'), "manager", "Manager");
    collaboration.set('role', ENUMS.COLLABORATION_ROLE.READ_ONLY);
    assert.equal(collaboration.get('roleHumanized'), "developer", "Developer");
  });
});
