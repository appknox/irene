import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class OrganizationStub extends Service {
  selected = {
    id: 1,
  };
}

class RealtimeStub extends Service {
  RegistrationRequestCounter = 0;
}

function registrationRequestSerializer(data, many = false) {
  if (many === true) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data.models.map((d) => {
        return {
          id: d.attrs.id,
          email: d.attrs.email,
          data: d.attrs.data,
          created_on: d.attrs.createdOn,
          updated_on: d.attrs.updatedOn,
          valid_until: d.attrs.validUntil,
          approval_status: d.attrs.approvalStatus,
          source: d.attrs.source,
          moderated_by: null,
          is_activated: d.attrs.isActivated,
        };
      }),
    };
  }
  return {
    id: data.attrs.id,
    email: data.attrs.email,
    data: data.attrs.data,
    created_on: data.attrs.createdOn,
    updated_on: data.attrs.updatedOn,
    valid_until: data.attrs.validUntil,
    approval_status: data.attrs.approvalStatus,
    source: data.attrs.source,
    moderated_by: null,
    is_activated: data.attrs.isActivated,
  };
}

module('Integration | Component | partner/invitation-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:organization', OrganizationStub);
    this.owner.register('service:realtime', RealtimeStub);
  });

  test('it should add new entry in invitations list on successful client invite', async function (assert) {
    const rrCount = 2;
    const rrInvites = this.server.createList(
      'partner/registration-request',
      rrCount,
      { approval_status: 'approved', source: 'invitation' }
    );
    const rrItem = rrInvites[0];

    this.server.get(
      'v2/partners/1/registration_requests',
      (schema, request) => {
        const is_activated = request.queryParams.is_activated;
        const status = request.queryParams.approval_status;
        const data = schema['partner/registrationRequests'].where({
          is_activated: is_activated,
          approval_status: status,
        });
        return registrationRequestSerializer(data, true);
      }
    );

    this.server.post(
      'v2/partners/1/registration_requests',
      (schema, request) => {
        const rrSchema = schema['partner/registrationRequests'];
        const body = JSON.parse(request.requestBody);
        let obj = rrSchema.create({
          email: body.email,
          data: {
            company: body.company,
            first_name: body.first_name,
            last_name: body.last_name,
          },
          approval_status: 'approved',
          source: 'invitation',
          is_activated: false,
        });
        const serData = registrationRequestSerializer(obj);
        return serData;
      }
    );

    await render(hbs`<Partner::InvitationList />`);
    assert.dom(`[data-test-invitation-id='${rrItem.attrs.id}']`).exists();
    assert.dom('[data-test-invitations-row]').exists({ count: rrCount });

    const inviteBtn = this.element.querySelector(
      '[data-test-invite-client-button]'
    );
    await click(inviteBtn);

    const emailInput = this.element.querySelector('[data-test-input-email]');
    const firstNameInput = this.element.querySelector(
      '[data-test-input-firstname]'
    );
    const lastNameInput = this.element.querySelector(
      '[data-test-input-lastname]'
    );
    const companyInput = this.element.querySelector(
      '[data-test-input-company]'
    );

    await fillIn(emailInput, 'test@test.test');
    await fillIn(firstNameInput, 'TestFirstName');
    await fillIn(lastNameInput, 'TestLastName');
    await fillIn(companyInput, 'TestCompany');
    await click('[data-test-input-send-btn]');

    assert.dom('[data-test-invite-client-form]').doesNotExist();
    assert.dom('[data-test-invitations-row]').exists({ count: rrCount + 1 });
  });
});
