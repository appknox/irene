import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/dashboard/file/dynamic-scan/results/apis-captured',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      const route = this.owner.lookup(
        'route:authenticated/dashboard/file/dynamic-scan/results/apis-captured'
      );
      assert.ok(route);
    });
  }
);
