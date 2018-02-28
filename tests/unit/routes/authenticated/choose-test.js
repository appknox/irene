import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/choose', 'Unit | Route | authenticated/choose', {
});

test('it exists', function(assert) {
  const route = this.subject();
  var store = {
    find: function() {
      return [
        {
          id:1,
          type: "file",
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
      type: "file",
      attributes: {
        name: "test"
      }
    }
  ]);
});
