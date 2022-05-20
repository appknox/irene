/* eslint-disable prettier/prettier, qunit/no-identical-names */
import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render, click, fillIn } from "@ember/test-helpers";
import { setupIntl } from "ember-intl/test-support";
import { setupMirage } from "ember-cli-mirage/test-support";
import { hbs } from "ember-cli-htmlbars";
import Service from "@ember/service";

class OrganizationStub extends Service {
  selected = {
    id: 1,
  };
}

class RealtimeStub extends Service {
  RegistrationRequestCounter = 0;
}

module("Integration | Component | partner/invite-client", function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, "en");

  hooks.beforeEach(function () {
    this.owner.register("service:organization", OrganizationStub);
    this.owner.register("service:realtime", RealtimeStub);
  });

  test("it should render invite button", async function (assert) {
    await render(hbs`<Partner::InviteClient />`);
    assert.dom("[data-test-invite-client-button]").exists();
    assert
      .dom("[data-test-invite-client-button]")
      .hasTextContaining("Invite Clients");
  });

  test("it should open modal with invite form on invite button click", async function (assert) {
    assert.dom("[data-test-invite-client-form]").doesNotExist();
    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);
    assert.dom("[data-test-invite-client-form]").exists();
  });

  test('it should close modal only on close button click', async function (assert) {
    assert.dom('[data-test-invite-client-form]').doesNotExist();
    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      '[data-test-invite-client-button]'
    );
    await click(inviteBtn);
    assert.dom('[data-test-invite-client-form]').exists();

    const overlayElement = this.element.querySelector('.ak-modal-overlay');
    await click(overlayElement);
    assert.dom('[data-test-invite-client-form]').exists();

    const closeButton = this.element.querySelector('[data-test-modal-close-btn]');
    await click(closeButton);
    assert.dom('[data-test-invite-client-form]').doesNotExist();
  });

  test("it should render email, first name, last name & company input fields", async function (assert) {
    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);
    assert.dom("[data-test-input-email]").exists();
    assert.dom("[data-test-input-firstname]").exists();
    assert.dom("[data-test-input-lastname]").exists();
    assert.dom("[data-test-input-company]").exists();
  });

  test("it does not render error messages on initial load", async function (assert) {
    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    assert.dom("[data-test-input-error-email]").doesNotExist();
    assert.dom("[data-test-input-error-name]").doesNotExist();
    assert.dom("[data-test-input-error-company]").doesNotExist();
  });

  test("it does not render error messages on initial load", async function (assert) {
    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    assert.dom("[data-test-input-error-email]").doesNotExist();
    assert.dom("[data-test-input-error-name]").doesNotExist();
    assert.dom("[data-test-input-error-company]").doesNotExist();
  });

  test("it should validate email on input", async function (assert) {
    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    const emailInput = this.element.querySelector("[data-test-input-email]");

    // accept valid email
    await fillIn(emailInput, "test@example.com");
    assert.dom("[data-test-input-error-email]").doesNotExist();

    await fillIn(emailInput, "t@t.1");
    assert.dom("[data-test-input-error-email]").doesNotExist();

    // reject invalid email formats
    await fillIn(emailInput, "test.com@");
    assert.dom("[data-test-input-error-email]").exists();

    await fillIn(emailInput, "🙂@🙂.🙂");
    assert.dom("[data-test-input-error-email]").exists();

    await fillIn(emailInput, "'@t.'");
    assert.dom("[data-test-input-error-email]").exists();

    // reject empty email
    await fillIn(emailInput, "");
    assert.dom("[data-test-input-error-email]").exists();
  });

  test("it should validate first name on input", async function (assert) {
    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    const firstNameInput = this.element.querySelector(
      "[data-test-input-firstname]"
    );

    // accept less than 150 characters
    await fillIn(firstNameInput, "f".repeat(150));
    assert.dom("[data-test-input-error-name]").doesNotExist();

    // reject more than 150 characters
    await fillIn(firstNameInput, "f".repeat(151));
    assert.dom("[data-test-input-error-name]").exists();

    // accept empty input
    await fillIn(firstNameInput, "");
    assert.dom("[data-test-input-error-name]").doesNotExist();

    // accept whitespace string
    await fillIn(firstNameInput, " ");
    assert.dom("[data-test-input-error-name]").doesNotExist();
  });

  test("it should validate last name on input", async function (assert) {
    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    const lastNameInput = this.element.querySelector(
      "[data-test-input-lastname]"
    );

    // accept less than 150 characters
    await fillIn(lastNameInput, "l".repeat(150));
    assert.dom("[data-test-input-error-name]").doesNotExist();

    // reject more than 150 characters
    await fillIn(lastNameInput, "l".repeat(151));
    assert.dom("[data-test-input-error-name]").exists();

    // accept empty input
    await fillIn(lastNameInput, "");
    assert.dom("[data-test-input-error-name]").doesNotExist();

    // accept whitespace string
    await fillIn(lastNameInput, " ");
    assert.dom("[data-test-input-error-name]").doesNotExist();
  });

  test("it should validate company name on input", async function (assert) {
    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    const companyInput = this.element.querySelector(
      "[data-test-input-company]"
    );

    // accept less than 150 characters
    await fillIn(companyInput, "c".repeat(255));
    assert.dom("[data-test-input-error-company]").doesNotExist();

    // reject more than 150 characters
    await fillIn(companyInput, "c".repeat(256));
    assert.dom("[data-test-input-error-company]").exists();

    // reject empty input
    await fillIn(companyInput, "");
    assert.dom("[data-test-input-error-company]").exists();

    // accept whitespace string
    await fillIn(companyInput, " ");
    assert.dom("[data-test-input-error-company]").doesNotExist();
  });

  test("it should close modal on valid form submit", async function (assert) {
    const rrInvitationSample = this.server.createList(
      "partner/registrationRequest",
      1,
      { approvalStatus: "approved", source: "invitation" }
    )[0];
    this.server.post(
      "v2/partners/1/registration_requests",
      (schema, request) => {
        const rrSchema = schema["partner/registrationRequests"];
        const body = JSON.parse(request.requestBody);
        let obj = rrSchema.create({
          email: body.email,
          data: {
            company: body.company,
            first_name: body.first_name,
            last_name: body.last_name,
          },
        });
        return { ...rrInvitationSample.attrs, ...obj.attrs };
      }
    );

    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    const emailInput = this.element.querySelector("[data-test-input-email]");
    const firstNameInput = this.element.querySelector(
      "[data-test-input-firstname]"
    );
    const lastNameInput = this.element.querySelector(
      "[data-test-input-lastname]"
    );
    const companyInput = this.element.querySelector(
      "[data-test-input-company]"
    );

    await fillIn(emailInput, "test@test.test");
    await fillIn(firstNameInput, "TestFirstName");
    await fillIn(lastNameInput, "TestLastName");
    await fillIn(companyInput, "TestCompany");

    await click("[data-test-input-send-btn]");

    assert.dom("[data-test-invite-client-form]").doesNotExist();
  });

  test("it should not close modal on form submission with invalid inputs", async function (assert) {
    const rrInvitationSample = this.server.createList(
      "partner/registrationRequest",
      1,
      { approvalStatus: "approved", source: "invitation" }
    )[0];
    this.server.post(
      "v2/partners/1/registration_requests",
      (schema, request) => {
        const rrSchema = schema["partner/registrationRequests"];
        const body = JSON.parse(request.requestBody);
        let obj = rrSchema.create({
          email: body.email,
          data: {
            company: body.company,
            first_name: body.first_name,
            last_name: body.last_name,
          },
        });
        return { ...rrInvitationSample.attrs, ...obj.attrs };
      }
    );

    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    const emailInput = this.element.querySelector("[data-test-input-email]");
    const companyInput = this.element.querySelector(
      "[data-test-input-company]"
    );

    await fillIn(emailInput, "");
    await fillIn(companyInput, "");

    await click("[data-test-input-send-btn]");

    assert.dom("[data-test-invite-client-form]").exists();
    assert.dom("[data-test-input-error-email]").exists();
    assert.dom("[data-test-input-error-company]").exists();
  });

  test("it should submit form with email & company but without first & last names", async function (assert) {
    const rrInvitationSample = this.server.createList(
      "partner/registrationRequest",
      1,
      { approvalStatus: "approved", source: "invitation" }
    )[0];
    this.server.post(
      "v2/partners/1/registration_requests",
      (schema, request) => {
        const rrSchema = schema["partner/registrationRequests"];
        const body = JSON.parse(request.requestBody);
        let obj = rrSchema.create({
          email: body.email,
          data: {
            company: body.company,
            first_name: body.first_name,
            last_name: body.last_name,
          },
        });
        return { ...rrInvitationSample.attrs, ...obj.attrs };
      }
    );

    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    const emailInput = this.element.querySelector("[data-test-input-email]");
    const firstNameInput = this.element.querySelector(
      "[data-test-input-firstname]"
    );
    const lastNameInput = this.element.querySelector(
      "[data-test-input-lastname]"
    );
    const companyInput = this.element.querySelector(
      "[data-test-input-company]"
    );

    await fillIn(emailInput, "test@test.test");
    await fillIn(firstNameInput, "");
    await fillIn(lastNameInput, "");
    await fillIn(companyInput, "TestCompany");

    await click("[data-test-input-send-btn]");

    assert.dom("[data-test-invite-client-form]").doesNotExist();
  });

  test("it should render api response field errors in respective inputs", async function (assert) {
    this.server.post(
      "v2/partners/1/registration_requests",
      {
        email: ["A user with this email has been already invited."],
      },
      400
    );

    await render(hbs`<Partner::InviteClient />`);
    const inviteBtn = this.element.querySelector(
      "[data-test-invite-client-button]"
    );
    await click(inviteBtn);

    assert.dom("[data-test-invite-client-form]").exists();

    const emailInput = this.element.querySelector("[data-test-input-email]");
    const companyInput = this.element.querySelector(
      "[data-test-input-company]"
    );

    await fillIn(emailInput, "test@test.test");
    await fillIn(companyInput, "Test");
    await click("[data-test-input-send-btn]");

    assert.dom("[data-test-invite-client-form]").exists();

    assert.dom("[data-test-input-error-email]").exists();
    assert
      .dom("[data-test-input-error-email]")
      .hasText("A user with this email has been already invited.");
  });
});
