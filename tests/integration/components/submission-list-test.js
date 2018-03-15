import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('submission-list', 'Integration | Component | submission list', {
  unit: true
});

test('it exists', function(assert) {
  const component = this.subject();
  var store = {
    findAll: function() {
      return [
        {
          id:1,
          type: "submission",
          attributes: {
            name: "test"
          }
        }
      ];
    }
  };
  component.set('store', store);
  Ember.run(function() {
    assert.deepEqual(component.get("submissions"), [{
        id:1,
        type: "submission",
        attributes: {
          name: "test"
        }
      }
    ]);
  });
});
