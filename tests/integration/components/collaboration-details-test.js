import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('collaboration-details', 'Integration | Component | collaboration details', {
  unit: true
});


test('tapping button fires an external action', function(assert) {
  assert.expect(1);

  var component = this.subject();

  Ember.run(function() {
    component.send('openAddCollaborationPrompt');
    component.send('closeAddCollaborationPrompt');
    assert.equal(component.get('showAddCollaborationPrompt'),false, "Collaboration Prompt");
  });
});
