import { module, test } from 'qunit';
import { setupTest } from 'irene/tests/helpers';

module('Unit | Service | ai-reporting', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:ai-reporting');
    assert.ok(service);
  });
});
