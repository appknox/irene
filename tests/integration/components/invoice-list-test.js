import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Integration | Component | invoice list', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const component = this.owner.factoryFor('component:invoice-list').create();
    var store = {
      findAll: function() {
        return [
          {
            id:1,
            type: "invoice",
            attributes: {
              name: "test"
            }
          }
        ];
      }
    };
    component.set('store', store);
    assert.deepEqual(component.get("invoices"), [{
        id:1,
        type: "invoice",
        attributes: {
          name: "test"
        }
      }
    ]);
    assert.equal(component.get('hasInvoices'), true, "Progress");
  });
});
