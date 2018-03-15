import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('login-component', 'Integration | Component | login component', {
  unit: true,
  needs: [
    'service:notification-messages-service'
  ]
});

test('tapping button fires an external action', function(assert) {
  var component = this.subject();
  component.send("authenticate");
  assert.equal(component.get("MFAEnabled"), false, 'MFA Enabled');
});
