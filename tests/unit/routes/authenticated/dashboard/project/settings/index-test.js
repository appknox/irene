import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/dashboard/project/settings/index',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      const route = this.owner.lookup(
        'route:authenticated/dashboard/project/settings/index'
      );

      assert.ok(route);
    });
  }
);
