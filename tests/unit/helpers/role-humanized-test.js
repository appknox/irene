import ENUMS from 'irene/enums';
import { module, test } from 'qunit';
import { roleHumanized } from 'irene/helpers/role-humanized';

module('Unit | Helper | role humanized');

test('it works', function(assert) {
  assert.equal(roleHumanized([42]), "changeRole", "Change Role");
  assert.equal(roleHumanized([ENUMS.COLLABORATION_ROLE.ADMIN]), "admin", "Admin");
  assert.equal(roleHumanized([ENUMS.COLLABORATION_ROLE.MANAGER]), "manager", "Manager");
  assert.equal(roleHumanized([ENUMS.COLLABORATION_ROLE.READ_ONLY]), "developer", "Developer");
});
