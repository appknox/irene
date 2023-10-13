import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/dashboard/sbom/component-details',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:authenticated/dashboard/sbom/component-details'
      );
      assert.ok(route);
    });
  }
);
