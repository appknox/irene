import { module, test } from 'qunit';
import { setupTest } from 'irene/tests/helpers';

module('Unit | Controller | authenticated/reports/generate', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:authenticated/reports/generate'
    );
    assert.ok(controller);
  });
});
