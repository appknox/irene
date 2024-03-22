import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/dashboard/organization/teams',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:authenticated/dashboard/organization/teams'
      );

      assert.ok(route);
    });
  }
);
