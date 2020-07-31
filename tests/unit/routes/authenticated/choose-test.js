import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated/choose', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:authenticated/choose');
    var store = {
      find: function() {
        return [
          {
            id:1,
            type: "file",
            attributes: {
              name: "test"
            }
          }
        ];
      }
    };
    route.set('store', store);
    assert.deepEqual(route.model(1), [{
        id:1,
        type: "file",
        attributes: {
          name: "test"
        }
      }
    ]);
  });
});
