import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-details', 'Integration | Component | file details', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set("file",
    {
      sortedAnalyses: [
        {
          id: 1,
          hasType: false
        },
        {
          id: 2,
          hasType: false
        },
        {
          id: 3,
          hasType: false
        }
      ]
    });
    assert.deepEqual(component.get("analyses"), [{"hasType": false,"id": 1},{"hasType": false,"id": 2},{"hasType": false,"id": 3}] , "Analyses");
  });
});
