import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/app-monitoring/monitoring-details/index',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:authenticated/app-monitoring/monitoring-details/index'
      );
      assert.ok(route);
    });
  }
);
