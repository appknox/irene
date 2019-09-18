import tHelper from 'ember-intl/helpers/t';
import { getOwner } from '@ember/application';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';

moduleForComponent('auth-mfa', 'Integration | Component | auth mfa', {
  unit: true,
  needs: [
    'service:ajax',
    'component:modal-card',
    'service:notification-messages-service',
    'service:session',
    'config:environment',
    'service:intl',
    'ember-intl@adapter:default',
    'cldr:en',
    'cldr:ja',
    'translation:en',
    'util:intl/missing-message'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:intl').setLocale('en');

    this.registry.register('helper:t', tHelper);

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

  run(function() {

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
