import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Integration | Component | submission list', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const component = this.owner.factoryFor('component:submission-list').create();
    var store = {
      peekAll: function() {
        return [
          {
            id:1,
            type: "submission",
            attributes: {
              name: "test"
            }
          }
        ];
      },
      query: function() {
        return [
          {
            id:1,
            type: "submission",
            attributes: {
              name: "test"
            }
          }
        ];
      }
    };
    component.set('store', store);
    run(function() {
      assert.deepEqual(component.get("submissions"), [{
          id:1,
          type: "submission",
          attributes: {
            name: "test"
          }
        }
      ]);
    });
  });
});
