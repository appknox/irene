import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | authenticated/dashboard/organization/users',
  function (hooks) {
    setupTest(hooks);

    // TODO: Replace this with your real tests.
    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:authenticated/dashboard/organization/users'
      );
      assert.ok(controller);
    });
  }
);
