import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | authenticated/dashboard/file/dynamic-scan/scheduled-automated',
  function (hooks) {
    setupTest(hooks);

    // TODO: Replace this with your real tests.
    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:authenticated/dashboard/file/dynamic-scan/scheduled-automated'
      );
      assert.ok(controller);
    });
  }
);
