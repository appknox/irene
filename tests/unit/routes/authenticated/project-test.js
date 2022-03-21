/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated/project', function(hooks) {
  setupTest(hooks);


  test('it exists', function(assert) {
    const route = this.owner.lookup('route:authenticated/project');
    var store = {
      findRecord: function() {
        return [
          {
            id:1,
            type: "project",
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
        type: "project",
        attributes: {
          name: "test"
        }
      }
    ]);
  });
});
