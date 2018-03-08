import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('modal-card', 'Integration | Component | modal card', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.send('clearModal');
    assert.equal(component.get('isActive'),false, "Active/False");
  });
});
