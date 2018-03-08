import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('jira-account', 'Integration | Component | jira account', {
  unit: true
});


test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.send('openRevokeJIRAConfirmBox');
    assert.equal(component.get('showRevokeJIRAConfirmBox'),true, "Open Modal");
    component.send('closeRevokeJIRAConfirmBox');
    assert.equal(component.get('showRevokeJIRAConfirmBox'),false, "Close Modal");
  });
});
