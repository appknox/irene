import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('confirm-box', 'Integration | Component | confirm box', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  assert.expect(1);

  var component = this.subject();

  Ember.run(function() {
    component.send('clearModal');
    assert.equal(component.get('isActive'),false, "Clear Modal");
  });
});
