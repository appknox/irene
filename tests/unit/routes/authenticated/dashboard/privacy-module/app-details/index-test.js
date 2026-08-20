import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/dashboard/privacy-module/app-details/index',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      const route = this.owner.lookup(
        'route:authenticated/dashboard/privacy-module/app-details/index'
      );
      assert.ok(route);
    });
  }
);
