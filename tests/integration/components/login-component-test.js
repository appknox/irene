import { test, moduleForComponent } from 'ember-qunit';
import tHelper from 'ember-intl/helpers/t';
import { getOwner } from '@ember/application';

moduleForComponent('login-component', 'Integration | Component | login component', {
  unit: true,
  needs: [
    'service:trial',
    'service:session',
    'service:notification-messages-service',
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
  },
});

test('tapping button fires an external action', function (assert) {
  var component = this.subject();
  component.send("authenticate");
  assert.equal(component.get("MFAEnabled"), false, 'MFA Enabled');
});
