import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('invoice-list', 'Integration | Component | invoice list', {
  unit: true
});

test('it exists', function(assert) {
  const component = this.subject();
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
