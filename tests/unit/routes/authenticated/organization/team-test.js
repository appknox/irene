import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/organization/team', 'Unit | Route | authenticated/organization/team', {
});

test('it exists', function(assert) {
  const route = this.subject();
  var store = {
    find: function() {
      return [
        {
          id:1,
          type: "team",
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
