import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/organization/teams', 'Unit | Route | authenticated/organization/teams', {
});

test('it exists', function(assert) {
  const route = this.subject();
  var store = {
    findAll: function() {
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
  assert.ok(route.model());
});
