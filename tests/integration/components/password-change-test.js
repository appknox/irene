import { getOwner } from '@ember/application';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';

moduleForComponent('password-change', 'Integration | Component | password change', {
  unit: true,
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

  run(function() {
    component.send("changePassword");
    component.set("passwordCurrent", "testpassword");
    component.set("passwordNew", "testpassword");
    component.set("passwordConfirm", "testpassword1");
    component.send("changePassword");
    component.set("passwordConfirm", "testpassword");
    component.send("changePassword");
    assert.equal(component.get("isChangingPassword"), true, 'Changing Password');
  });
});
