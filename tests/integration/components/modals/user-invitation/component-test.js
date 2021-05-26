import {
  module,
  test
} from 'qunit';
import {
  setupRenderingTest
} from 'ember-qunit';
import {
  render,
  click,
  fillIn
} from '@ember/test-helpers';
import {
  hbs
} from 'ember-cli-htmlbars';
import tHelper from 'ember-intl/helpers/t';

module('Integration | Component | modals/user-invitation', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    // set the locale and the config
    // await this.server.createList('organization', 2);
    // await this.owner.lookup('service:organization').load();
    this.owner.lookup('service:intl').setLocale('en');
    this.owner.register('helper:t', tHelper);
  });

  test('Should have only 4 input fields', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    assert.expect(1)
    await render(hbs `<Modals::UserInvitation />`);

    assert.equal(this.element.querySelectorAll('input[data-test-input]').length, 4);
  });

  test('No error on initial rendering', async function (assert) {
    assert.expect(2);

    await render(hbs `<Modals::UserInvitation />`);

    assert.notOk(this.element.querySelector('span[data-test-input-error="email"]'), 'Email error not shown');
    assert.notOk(this.element.querySelector('span[data-test-input-error="company"]'), 'Company error not shown');
  });

  test('Validate required fields and error should be shown', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    assert.expect(2);

    await render(hbs `<Modals::UserInvitation />`);

    // click send button
    await click('button[data-test-input-btn]');

    assert.ok(this.element.querySelector('span[data-test-input-error="email"]'), 'Email error should be shown');
    assert.ok(this.element.querySelector('span[data-test-input-error="company"]'), 'Company error should be shown');
  });

  test('Verify invitation flow', async function (assert) {
    assert.expect(1)
    this.set('inviteSent', function (val) {
      console.log('user invited', val);
    })
    await render(hbs `<Modals::UserInvitation @onSent={{action this.inviteSent}}/>`);
    const firstName = this.element.querySelector('input[data-test-input="first_name"]');
    const lastName = this.element.querySelector('input[data-test-input="last_name"]');
    const email = this.element.querySelector('input[data-test-input="email"]');
    const company = this.element.querySelector('input[data-test-input="company"]');
    fillIn(firstName, "bot");
    fillIn(lastName, "appknox");
    fillIn(email, "bot@appknox.com");
    fillIn(company, "Appknox");

    await click('button[data-test-input-btn]');
    assert.ok(assert.dom('button[data-test-input-btn]'))
  })
});
