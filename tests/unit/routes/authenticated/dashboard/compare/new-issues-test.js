import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/dashboard/compare/new-issues',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:authenticated/dashboard/compare/new-issues'
      );
      assert.ok(route);
    });
  }
);
