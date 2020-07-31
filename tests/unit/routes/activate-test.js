import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | activate', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:activate');
    assert.ok(route);
  });
});
