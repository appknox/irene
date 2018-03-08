import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('team-member', 'Integration | Component | team member', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.send('openRemoveMemberPrompt');
    assert.equal(component.get('showRemoveMemberPrompt'),true, "Open Modal");
    component.send('closeRemoveMemberPrompt');
    assert.equal(component.get('showRemoveMemberPrompt'),false, "Close Modal");
  });
});
