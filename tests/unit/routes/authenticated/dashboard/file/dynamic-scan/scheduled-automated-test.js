import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/dashboard/file/dynamic-scan/scheduled-automated',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:authenticated/dashboard/file/dynamic-scan/scheduled-automated'
      );
      assert.ok(route);
    });
  }
);
