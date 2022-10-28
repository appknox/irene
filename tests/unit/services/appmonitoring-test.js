import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | appmonitoring', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:appmonitoring');
    assert.ok(service);
  });
});
