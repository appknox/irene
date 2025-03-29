import { setupTest } from 'irene/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Model | ai reporting/report', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('ai-reporting/report', {});
    assert.ok(model, 'model exists');
  });
});
