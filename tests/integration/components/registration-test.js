import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | registration', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Registration></Registration>`);
    assert.dom("[data-test-registration-form]").exists();
    assert.dom("[data-test-registration-form-title]").hasText("t:register:()");
  });

  test('it should render email and company name always', async function(assert) {
    await render(hbs`<Registration></Registration>`);
    assert.dom("[data-test-registration-input-email]").exists();
    assert.dom("[data-test-registration-input-company]").exists();
  });

  test('it should not render first name and last name by defaults', async function(assert) {
    await render(hbs`<Registration></Registration>`);
    assert.dom("[data-test-registration-input-email]").exists();
    assert.dom("[data-test-registration-input-company]").exists();
    assert.dom("[data-test-registration-input-fname]").doesNotExist();
    assert.dom("[data-test-registration-input-lname]").doesNotExist();
  });

  test('it should render first name and last name if enable_name is true', async function(assert) {
    this.set('enable_name', false);
    await render(hbs`<Registration @enable_name={{this.enable_name}}></Registration>`);
    assert.dom("[data-test-registration-input-fname]").doesNotExist();
    assert.dom("[data-test-registration-input-lname]").doesNotExist();

    this.set('enable_name', true);
    await render(hbs`<Registration @enable_name={{this.enable_name}}></Registration>`);
    assert.dom("[data-test-registration-input-fname]").exists();
    assert.dom("[data-test-registration-input-lname]").exists();
  });

  test('it should show validation error for empty email', async function(assert) {
    await render(hbs`<Registration></Registration>`);
    assert.dom("[data-test-register-btn]").exists();
    const register_btn = this.element.querySelector("[data-test-register-btn]");
    await click(register_btn);
    assert.dom("[data-test-registration-input-email-error]").hasText("Email must be a valid email address");
  });

  test('it should show validation error for invalid email', async function(assert) {
    await render(hbs`<Registration></Registration>`);
    assert.dom("[data-test-register-btn]").exists();
    assert.dom("[data-test-registration-input-email]").exists();
    const invalid_emails = [
      "test",
      "test@test",
      "@test2",
      "test@test.",
    ]
    const register_btn = this.element.querySelector("[data-test-register-btn]");
    const email_input = this.element.querySelector("[data-test-registration-input-email]");

    for (let email of invalid_emails) {
      fillIn(email_input, email);
      await click(register_btn);
      assert.dom("[data-test-registration-input-email-error]").hasText("Email must be a valid email address");
    }
  });

  test('it should show not show validation error for valid email', async function(assert) {
    await render(hbs`<Registration></Registration>`);
    assert.dom("[data-test-register-btn]").exists();
    assert.dom("[data-test-registration-input-email]").exists();
    const valid_emails = [
      "test@test.com",
    ]
    const register_btn = this.element.querySelector("[data-test-register-btn]");
    const email_input = this.element.querySelector("[data-test-registration-input-email]");
    for (let email of valid_emails) {
      fillIn(email_input, email);
      await click(register_btn);
      assert.dom("[data-test-registration-input-email-error]").doesNotExist();
    }
  });

  test('it should show validation error for empty company', async function(assert) {
    await render(hbs`<Registration></Registration>`);
    assert.dom("[data-test-register-btn]").exists();
    const register_btn = this.element.querySelector("[data-test-register-btn]");
    await click(register_btn);
    assert.dom("[data-test-registration-input-company-error]").hasText("Company can't be blank");
  });

  test('it should not show validation error for non-empty company', async function(assert) {
    await render(hbs`<Registration></Registration>`);
    assert.dom("[data-test-register-btn]").exists();
    const register_btn = this.element.querySelector("[data-test-register-btn]");
    const company_input = this.element.querySelector("[data-test-registration-input-company]");
    fillIn(company_input, "Appknox");
    await click(register_btn);
    assert.dom("[data-test-registration-input-company-error]").doesNotExist();
  });

  test('it should show validation error for empty firstname and lastname', async function(assert) {
    this.set('enable_name', true);
    await render(hbs`<Registration @enable_name={{this.enable_name}}></Registration>`);
    const register_btn = this.element.querySelector("[data-test-register-btn]");
    await click(register_btn);
    assert.dom("[data-test-registration-input-name-error]").hasText("Firstname can't be blank");
  })

  // test('it should show success view for valid email and company', async function(assert) {
  //   // this.server.post('/api/v2/registration', (schema, request) => {
  //   //   debugger;
  //   //   return {};
  //   // })
  //   await render(hbs`<Registration></Registration>`);
  //   assert.dom("[data-test-register-btn]").exists();
  //   const register_btn = this.element.querySelector("[data-test-register-btn]");
  //   const email_input = this.element.querySelector("[data-test-registration-input-email]");
  //   const company_input = this.element.querySelector("[data-test-registration-input-company]");
  //   fillIn(email_input, "appknoxuser@appknox.com");
  //   fillIn(company_input, "Appknox");
  //   await click(register_btn);
  //   assert.dom("[data-test-registration-input-company-error]").doesNotExist();
  //   assert.dom("[data-test-registration-input-email-error]").doesNotExist();
  // });
});
