import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/organization/users', 'Unit | Route | authenticated/organization/users', {
});

test('it exists', function(assert) {
  const route = this.subject();
  var store = {
    findAll: function() {
      return [
        {
          id:1,
          type: "user",
          attributes: {
            name: "test"
          }
        }
      ];
    }
  };
  route.set('store', store);
  assert.ok(route.model());
});
