import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/project/settings/dast-automation-scenario',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      const route = this.owner.lookup(
        'route:authenticated/project/settings/dast-automation-scenario'
      );

      assert.ok(route);
    });
  }
);
