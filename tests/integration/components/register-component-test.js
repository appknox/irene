import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';

moduleForComponent('register-component', 'Integration | Component | register component', {
  unit: true,
  needs: [
    'component:g-recaptcha',
    'component:fa-icon',
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
    assert.notOk(component.init());
    component.send("onCaptchaResolved");
  });
});
