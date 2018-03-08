import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('password-setup', 'Integration | Component | password setup', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.set("password", "test");
    assert.equal(component.validate()[0], "Password length must be greater than or equal to 6", "Validate Password");
    component.set("password", "test233s");
    component.set("confirmPassword", "test233s1");
    assert.equal(component.validate()[0], "Passwords doesn't match", "Validate Password");
  });
});
