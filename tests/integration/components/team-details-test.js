import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('team-details', 'Integration | Component | team details', {
  unit: true
});

test('it exists', function(assert) {
  const component = this.subject();
  // var store = {
  //   findAll: function() {
  //     return [
  //       {
  //         id:1,
  //         type: "invitation",
  //         attributes: {
  //           name: "test"
  //         }
  //       }
  //     ];
  //   }
  // };
  // component.set('store', store);
  // Ember.run(function() {
  //   assert.deepEqual(component.get("invitations"), [{
  //       id:1,
  //       type: "invitation",
  //       attributes: {
  //         name: "test"
  //       }
  //     }
  //   ]);
  // });
  component.send('openAddMemberModal');
  assert.equal(component.get('showAddMemberModal'),true, "Open Modal");
  component.send('closeAddMemberModal');
  assert.equal(component.get('showAddMemberModal'),false, "Close Modal");
});
