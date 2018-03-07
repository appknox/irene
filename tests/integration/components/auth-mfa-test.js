import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('auth-mfa', 'Integration | Component | auth mfa', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  assert.expect(2);

  var component = this.subject();

  Ember.run(function() {

    component.send('openMFAEnableModal');
    component.send('openMFADisableModal');
    component.send('closeMFAEnableModal');
    component.send('closeMFADisableModal');
    component.send('showBarCode');

    assert.equal(component.get("showMFAIntro"), false, 'MFA Into');
    assert.equal(component.get("showBarCode"), true, 'Barcode');
  });
});
