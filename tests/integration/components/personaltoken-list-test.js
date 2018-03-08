import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('personaltoken-list', 'Integration | Component | personaltoken list', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.send('openGenerateTokenModal');
    assert.equal(component.get('showGenerateTokenModal'),true, "Open Modal");
  });
});
