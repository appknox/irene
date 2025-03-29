import { setupTest } from 'irene/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Adapter | ai reporting/report', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const adapter = this.owner.lookup('adapter:ai-reporting/report');
    assert.ok(adapter, 'adapter exists');
  });
});
