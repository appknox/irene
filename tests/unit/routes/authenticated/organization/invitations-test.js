import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/organization/invitations', 'Unit | Route | authenticated/organization/invitations', {
});

test('it exists', function(assert) {
  const route = this.subject();
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
  route.set('store', store);
  assert.ok(route.model());
});
