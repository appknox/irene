import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | project team', function(hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:project-team');
    assert.ok(adapter);
  });
});
