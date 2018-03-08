import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('github-account', 'Integration | Component | github account', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();

  Ember.run(function() {
    component.send('openRevokeGithubConfirmBox');
    assert.equal(component.get('showRevokeGithubConfirmBox'),true, "Open Modal");
    component.send('closeRevokeGithubConfirmBox');
    assert.equal(component.get('showRevokeGithubConfirmBox'),false, "Close Modal");
  });
});
