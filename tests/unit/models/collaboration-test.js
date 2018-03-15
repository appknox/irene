import Ember from 'ember';
import ENUMS from 'irene/enums';
import { moduleForModel, test} from 'ember-qunit';


moduleForModel('collaboration', 'Unit | Model | collaboration', {
  needs: ['model:project', 'model:user', 'model:team']
});

test('it exists', function(assert) {
  const collaboration = this.subject();
  Ember.run(function() {
    assert.equal(collaboration.get('hasRole'), true, "Has Role");

    collaboration.set('role', ENUMS.COLLABORATION_ROLE.UNKNOWN);
    assert.equal(collaboration.get('hasRole'), false, "No role");

    assert.equal(collaboration.get('roleHumanized'), "noPreference", "No Preference");
    collaboration.set('role', ENUMS.COLLABORATION_ROLE.ADMIN);
    assert.equal(collaboration.get('roleHumanized'), "admin", "Admin");
    collaboration.set('role', ENUMS.COLLABORATION_ROLE.MANAGER);
    assert.equal(collaboration.get('roleHumanized'), "manager", "Manager");
    collaboration.set('role', ENUMS.COLLABORATION_ROLE.READ_ONLY);
    assert.equal(collaboration.get('roleHumanized'), "developer", "Developer");
  });
});
