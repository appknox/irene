import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/project', 'Unit | Route | authenticated/project', {
});


test('it exists', function(assert) {
  const route = this.subject();
  var store = {
    findRecord: function() {
      return [
        {
          id:1,
          type: "project",
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
      type: "project",
      attributes: {
        name: "test"
      }
    }
  ]);
});
