import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/teams', 'Unit | Route | authenticated/teams', {
  needs:[
    'model:team'
  ]
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
  assert.deepEqual(route.model(), [{
      id:1,
      type: "team",
      attributes: {
        name: "test"
      }
    }
  ]);
});
