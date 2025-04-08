import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | privacy-module', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:privacy-module');
    assert.ok(service);
  });
});
