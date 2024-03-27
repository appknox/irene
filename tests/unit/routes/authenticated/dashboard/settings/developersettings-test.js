/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | authenticated/dashboard/settings/developersettings',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:authenticated/dashboard/settings/developersettings'
      );
      assert.ok(route);
    });
  }
);
