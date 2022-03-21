/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | invitation', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:invitation');
    var store = {
      findRecord: function() {
        return [
          {
            id:1,
            type: "invitation",
            attributes: {
              name: "test"
            }
          }
        ];
      }
    };
    route.set('store', store);
    assert.ok(route.model(1));
  });
});
