import { moduleForModel, test } from 'ember-qunit';
import ENUMS from 'irene/enums';

moduleForModel('collaboration', 'Unit | Model | collaboration', {
  needs: ['model:project', 'model:user', 'model:team']
});

test('it exists', function(assert) {
  const collaboration = this.subject();
  assert.equal(collaboration.get('hasRole'), ENUMS.COLLABORATION_ROLE.UNKNOWN, true);
  assert.equal(collaboration.get('hasRole'), true);
});
