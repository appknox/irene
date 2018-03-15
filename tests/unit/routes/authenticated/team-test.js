import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/team', 'Unit | Route | authenticated/team', {
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
  assert.deepEqual(route.model(1), [{
      id:1,
      type: "team",
      attributes: {
        name: "test"
      }
    }
  ]);
});
