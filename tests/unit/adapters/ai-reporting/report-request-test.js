import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | report request', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const adapter = this.owner.lookup('adapter:ai-reporting/report-request');
    assert.ok(adapter, 'adapter exists');
  });
});
