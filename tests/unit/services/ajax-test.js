import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | ajax', function(hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:ajax');
    assert.ok(service);
  });
});
