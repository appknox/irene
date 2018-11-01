import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

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
  run(function() {
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
