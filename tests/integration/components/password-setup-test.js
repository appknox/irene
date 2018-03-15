import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

moduleForComponent('password-setup', 'Integration | Component | password setup', {
  unit: true,
  needs: [
    'service:i18n',
    'service:ajax',
    'service:notification-messages-service',
    'service:session'
  ],
  beforeEach() {
    // start Mirage
    this.server = startMirage();
  },
  afterEach() {
    // shutdown Mirage
    this.server.shutdown();
  }
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.set("password", "test");
    assert.equal(component.validate()[0], "Password length must be greater than or equal to 6", "Validate Password");
    component.set("password", "test233s");
    component.set("confirmPassword", "test233s1");
    assert.equal(component.validate()[0], "Passwords doesn't match", "Validate Password");

    component.send("setup");

    component.set("password", "test21234");
    component.set("confirmPassword", "test21234");

    assert.equal(component.validate(), undefined, "Validate Password");

    component.send("setup");
    assert.equal(component.get("isSettingPassword"), true, 'Setting Password');
  });
});
