import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | realtime', function(hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:realtime');
    assert.ok(service);
  });
});
