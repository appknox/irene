import { getOwner } from '@ember/application';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { run } from '@ember/runloop';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('password-setup', 'Integration | Component | password setup', {
  needs: [
    'service:i18n',
    'service:ajax',
    'service:notification-messages-service',
    'service:session',
    'locale:en/translations',
    'locale:en/config',
    'util:i18n/missing-message',
    'util:i18n/compile-template',
    'config:environment'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);

    // register t helper
    this.register('helper:t', tHelper);
  },
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  run(function() {
    component.set("password", "test");
    assert.equal(component.validate()[0], "Passwords must be greater than or equal to 6", "Validate Password");
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
