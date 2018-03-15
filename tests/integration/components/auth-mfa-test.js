import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

moduleForComponent('auth-mfa', 'Integration | Component | auth mfa', {
  unit: true,
  needs: [
    'service:i18n',
    'service:ajax',
    'component:modal-card',
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
    Ember.getOwner(this).lookup('service:i18n').set('locale', 'en');
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
  this.render();

  Ember.run(function() {

    component.send('openMFAEnableModal');
    component.send('openMFADisableModal');
    component.send('closeMFAEnableModal');
    component.send('closeMFADisableModal');
    component.send('showBarCode');

    assert.equal(component.get("showMFAIntro"), false, 'MFA Into');
    component.set("user", {provisioningURL: "https://"});
    assert.ok(component.didInsertElement());

    assert.equal(component.get("showBarCode"), true, 'Barcode');

    component.set("enableMFAOTP", "123456");
    component.send('enableMFA');
    component.set("enableMFAOTP", "12345");
    component.send('enableMFA');

    component.set("disableMFAOTP", "123456");
    component.send('disableMFA');
    component.set("disableMFAOTP", "12345");
    component.send('disableMFA');

  });
});
