import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('team-overview', 'Integration | Component | team overview', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.send('openDeleteTeamPrompt');
    assert.equal(component.get('showDeleteTeamPrompt'),true, "Open Modal");
    component.send('closeDeleteTeamPrompt');
    assert.equal(component.get('showDeleteTeamPrompt'),false, "Close Modal");
  });
});
