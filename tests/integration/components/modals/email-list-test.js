import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | modals/email-list', function (hooks) {
  setupRenderingTest(hooks);

  const emails = [];
  for (let i = 0; i <= 5; i++) {
    emails.push(`test+${i}@test.app`);
  }

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Modals::EmailList />`);
    assert.dom('div[data-test-email-list]').exists();
  });

  test('it renders 1 default email', async function (assert) {
    const emails = [];
    for (let i = 0; i <= 5; i++) {
      emails.push(`test+${i}@test.app`);
    }
    this.set('emails', emails)
    await render(hbs`<Modals::EmailList @emails={{this.emails}}/>`);
    assert.dom('div[data-test-default-email]').hasText(this.emails.firstObject)
  });

  test('it renders 3 default emails', async function (assert) {
    this.set('emails', emails)
    await render(hbs`<Modals::EmailList @emails={{this.emails}} @defaultCount=3/>`);
    const defaultEmails = this.emails.slice(0, 3).join(', ');
    assert.dom('div[data-test-default-email]').hasText(defaultEmails)
  });

  test('it renders button with remaining count as +5', async function (assert) {
    this.set('emails', emails)
    await render(hbs`<Modals::EmailList @emails={{this.emails}}/>`);
    assert.dom('button[data-test-owner-list-btn]').hasText('+5');
  });

  test('it should not render remaining count button', async function (assert) {
    let emails = ['test+0@test.app'];
    this.set('emails', emails)
    await render(hbs`<Modals::EmailList @emails={{this.emails}}/>`);
    assert.dom('button[data-test-owner-list-btn]').doesNotExist()
  });

  test('it should open email list with modal when clicking on remaining count btn', async function (assert) {
    this.set('emails', emails)
    await render(hbs`<Modals::EmailList @emails={{this.emails}}/>`);
    await click(this.element.querySelector('button[data-test-owner-list-btn]'));
    assert.dom('div[data-test-email-list-modal]').exists();
  });

  test('it should show 6 emails in the modal', async function (assert) {
    this.set('emails', emails)
    await render(hbs`<Modals::EmailList @emails={{this.emails}}/>`);
    await click(this.element.querySelector('button[data-test-owner-list-btn]'));
    for (let i = 0; i <= 5; i++) {
      assert.dom(`div[data-test-email-list-item="${i}"]`).hasText(`${i + 1}. test+${i}@test.app`);
    }
  });

  test('it renders empty when empty email is sent', async function (assert) {
    const emails = [];
    this.set('emails', emails)
    await render(hbs`<Modals::EmailList @emails={{this.emails}}/>`);

    assert.dom('div[data-test-default-email]').hasText('')
  });
});
