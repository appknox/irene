import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('personaltoken-detail', 'Integration | Component | personaltoken detail', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.send('openRevokePersonalTokenConfirmBox');
    assert.equal(component.get('showRevokePersonalTokenConfirmBox'),true, "Open Modal");
    component.send('closeRevokePersonalTokenConfirmBox');
    assert.equal(component.get('showRevokePersonalTokenConfirmBox'),false, "Close Modal");
  });
});
