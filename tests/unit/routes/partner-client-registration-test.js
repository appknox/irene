import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | partner-client-registration', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:partner-client-registration');
    assert.ok(route);
  });
});
