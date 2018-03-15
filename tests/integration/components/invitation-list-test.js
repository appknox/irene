import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('invitation-list', 'Integration | Component | invitation list', {
  unit: true
});

test('it exists', function(assert) {
  const component = this.subject();
  var store = {
    findAll: function() {
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
  component.set('store', store);
  assert.deepEqual(component.get("invitations"), [{
      id:1,
      type: "invitation",
      attributes: {
        name: "test"
      }
    }
  ]);
});
