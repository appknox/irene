import { moduleFor, test } from 'ember-qunit';

moduleFor('route:invitation', 'Unit | Route | invitation', {
});

test('it exists', function(assert) {
  const route = this.subject();
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
