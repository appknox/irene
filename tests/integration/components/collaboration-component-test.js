import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('collaboration-component', 'Integration | Component | collaboration component', {
  unit: true
});

test('it exists', function(assert) {
  const component = this.subject();
  var store = {
    query: function() {
      return [
        {
          id:1,
          type: "collaboration",
          attributes: {
            name: "test"
          }
        }
      ];
    },
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
  component.set('store', store);
  Ember.run(function() {
    assert.deepEqual(component.get("collaborations"), [{
        id:1,
        type: "collaboration",
        attributes: {
          name: "test"
        }
      }
    ]);
    assert.deepEqual(component.get("teams"), [{
        id:1,
        type: "team",
        attributes: {
          name: "test"
        }
      }
    ]);
    component.send('openCollaborationModal');
    component.send('closeModal');
    assert.equal(component.get("showCollaborationModal"), false, 'Show Modal');
  });
});
