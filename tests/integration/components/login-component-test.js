import {
  module,
  test
} from 'qunit';
import {
  setupRenderingTest
} from 'ember-qunit';
import tHelper from 'ember-intl/helpers/t';
import {
  render,
  click,
  settled
} from '@ember/test-helpers';
import {
  hbs
} from 'ember-cli-htmlbars';

module('Integration | Component | login component', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');

    this.owner.register('helper:t', tHelper);
  });

  // TODO should move to util testing
  test('tapping button fires an external action', function (assert) {
    var component = this.owner.factoryFor('component:login-component').create();
    component.send("authenticate");
    assert.false(component.get("MFAEnabled"), 'MFA Enabled');
  });

  test('Check authentication', async function (assert) {
    this.setProperties({
      username: "bot",
      isSS0Enabled: null,
      isSS0Enforced: null
    })
    await render(hbs `<LoginComponent
      @identification={{this.username}}
      @isSS0Enabled={{this.isSS0Enabled}}
      @isSS0Enforced={{this.isSS0Enforced}}></LoginComponent>`);
    await settled();
    await click('button.input-button');
    assert.false(this.get('isSS0Enabled'), 'SSO is not enabled');
    assert.false(this.get('isSS0Enforced'), 'SSO is not enforced')
  })
});
