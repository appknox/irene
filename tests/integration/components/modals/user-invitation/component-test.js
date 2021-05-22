import {
  module,
  test
} from 'qunit';
import {
  setupRenderingTest
} from 'ember-qunit';
import {
  render,
  click
} from '@ember/test-helpers';
import {
  hbs
} from 'ember-cli-htmlbars';
import tHelper from 'ember-intl/helpers/t';

module('Integration | Component | modals/user-invitation', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
    this.owner.register('helper:t', tHelper);
  });

  test('Should have only 4 input fields', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    assert.expect(1)
    await render(hbs `<Modals::UserInvitation />`);

    assert.equal(this.element.querySelectorAll('div[data-input-container]').length, 4);
  });

  test('No error on initial rendering', async function (assert) {
    assert.expect(2);

    await render(hbs `<Modals::UserInvitation />`);

    assert.notOk(this.element.querySelector('div[data-input-container="email"] > span[data-input-error]'), 'Email error not shown');
    assert.notOk(this.element.querySelector('div[data-input-container="company"] > span[data-input-error]'), 'Company error not shown');
  });

  test('Validate required fields and error should be shown', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    assert.expect(2);

    await render(hbs `<Modals::UserInvitation />`);

    // click send button
    await click('button[data-input-btn]');

    assert.ok(this.element.querySelector('div[data-input-container="email"] > span[data-input-error]'), 'Empty email input shown error');
    assert.ok(this.element.querySelector('div[data-input-container="company"] > span[data-input-error]'), 'Empty company input shown error');
  });
});
