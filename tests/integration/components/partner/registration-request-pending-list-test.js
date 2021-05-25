import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

// Stub organization service
class OrganizationStub extends Service {
  selected = {
    id: 1,
  }
}

class RealtimeStub extends Service {
  RegistrationRequestCounter = 0
}

function registrationRequestSerializer(data, many=false) {
  if (many === true) {
    return {
      "count": data.length,
      "next": null,
      "previous": null,
      "results": data.models.map(d => {
        return {
          "id": d.attrs.id,
          "email": d.attrs.email,
          "data": d.attrs.data,
          "created_on": d.attrs.createdOn,
          "updated_on": d.attrs.updatedOn,
          "valid_until": d.attrs.validUntil,
          "approval_status": d.attrs.approvalStatus,
          "source": d.attrs.source,
          "moderated_by": null,
          "is_activated": d.attrs.isActivated
        };
      })
    }
  }
  return {
    "id": data.attrs.id,
    "email": data.attrs.email,
    "data": data.attrs.data,
    "created_on": data.attrs.createdOn,
    "updated_on": data.attrs.updatedOn,
    "valid_until": data.attrs.validUntil,
    "approval_status": data.attrs.approvalStatus,
    "source": data.attrs.source,
    "moderated_by": null,
    "is_activated": data.attrs.isActivated
  }
}


module('Integration | Component | partner/registration-request-pending-list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function() {
    this.owner.register('service:organization', OrganizationStub);
  });

  hooks.beforeEach(function() {
    this.owner.register('service:realtime', RealtimeStub);
  });

  test('it renders translated section title', async function(assert) {
    await render(hbs`<Partner::RegistrationRequestPendingList />`);
    assert.dom("[data-test-pending-requests-title]").exists();
    assert.dom("[data-test-pending-requests-title]").hasText("t:pendingRequests:()");
  });

  test('it renders loading error on data fetch error', async function(assert) {
    this.server.get('v2/partners/1/registration_requests', () => {
      return new Response(500);
    });
    await render(hbs`<Partner::RegistrationRequestPendingList />`);
    assert.dom("[data-test-pending-requests-loading-error]").exists();
    assert.dom("[data-test-pending-requests-loader]").doesNotExist();
    assert.dom("[data-test-pending-requests-list]").doesNotExist();
  });

  test('it renders empty state', async function(assert) {
    this.server.get('v2/partners/1/registration_requests', () => {
      return {
        "count": 0,
        "next": null,
        "previous": null,
        "results": []
      };
    });
    await render(hbs`<Partner::RegistrationRequestPendingList />`);
    assert.dom("[data-test-pending-requests-empty]").exists();
    assert.dom("[data-test-pending-requests-empty]").hasText("No pending requests");
    assert.dom("[data-test-pending-requests-list]").doesNotExist();
  });

  test('it should not render loading indicator or error once data is loaded', async function(assert) {
    this.server.get('v2/partners/1/registration_requests', () => {
      return {
        "count": 0,
        "next": null,
        "previous": null,
        "results": []
      };
    });
    await render(hbs`<Partner::RegistrationRequestPendingList />`);
    assert.dom("[data-test-pending-requests-loader]").doesNotExist();
    assert.dom("[data-test-pending-requests-loading-error]").doesNotExist();
    assert.dom("[data-test-pending-requests-empty]").exists();
  });

  test('it renders table header for pending requests', async function(assert) {
    this.server.createList("partner/registrationRequest", 1, { "approvalStatus": "pending" });

    this.server.get('v2/partners/1/registration_requests', (schema, request) => {
      const is_activated = request.queryParams.is_activated;
      const status= request.queryParams.status;
      const data = schema["partner/registrationRequests"].where({
        isActivated: is_activated,
        approvalStatus: status
      });
      return registrationRequestSerializer(data, true)
    });

    await render(hbs`<Partner::RegistrationRequestPendingList />`);

    assert.dom("[data-test-pending-requests-table-header]").exists();
    const header = this.element.querySelector("[data-test-pending-requests-table-header]");
    assert.equal(header.children[0].textContent, "Requested by");
    assert.equal(header.children[1].textContent, "Company");
    assert.equal(header.children[2].textContent, "Requested");
    assert.equal(header.children[3].textContent, "Invite");
    assert.equal(header.children[4].textContent, "Reject");
  });

  test('it does not render table header for empty state', async function(assert) {
    this.server.get('v2/partners/1/registration_requests', () => {
      return {
        "count": 0,
        "next": null,
        "previous": null,
        "results": []
      };
    });

    await render(hbs`<Partner::RegistrationRequestPendingList />`);

    assert.dom("[data-test-pending-requests-table-header]").doesNotExist();
    assert.dom("[data-test-pending-requests-empty]").exists();
  });

  test('it renders pending registrations requests list', async function(assert) {
    this.server.createList("partner/registrationRequest", 5, { "approvalStatus": "pending" });
    this.server.get('v2/partners/1/registration_requests', (schema, request) => {
      const is_activated = request.queryParams.is_activated;
      const status= request.queryParams.status;
      const data = schema["partner/registrationRequests"].where({
        isActivated: is_activated,
        approvalStatus: status
      });
      return registrationRequestSerializer(data, true)
    });

    await render(hbs`<Partner::RegistrationRequestPendingList />`);

    assert.dom("[data-test-pending-requests-list]").exists();
    const rows = this.element.querySelectorAll("[data-test-pending-request-row]");
    assert.equal(rows.length, 5)
    assert.dom("[data-test-pending-requests-empty]").doesNotExist();
    assert.dom("[data-test-pending-requests-list]").exists();
  });

  test('rejection action should remove the request from pending list', async function(assert) {
    const rrsPending = this.server.createList("partner/registrationRequest", 5, { "approvalStatus": "pending" });
    const rrPendingObj = rrsPending[0];

    this.server.get('v2/partners/1/registration_requests', (schema, request) => {
      const is_activated = request.queryParams.is_activated;
      const status= request.queryParams.status;
      const data = schema["partner/registrationRequests"].where({
        isActivated: is_activated,
        approvalStatus: status
      });
      return registrationRequestSerializer(data, true)
    });

    this.server.patch('v2/partners/1/registration_requests/:id', (schema, request) => {
      const obj = schema["partner/registrationRequests"].find(request.params.id)
      const body = JSON.parse(request.requestBody);
      obj.update({
        'approvalStatus': body.approval_status,
      })
      return registrationRequestSerializer(obj);
    });

    this.server.get('v2/partners/1/registration_requests/:id', (schema, request) => {
      const obj = schema["partner/registrationRequests"].find(request.params.id)
      return registrationRequestSerializer(obj);
    });

    await render(hbs`<Partner::RegistrationRequestPendingList />`);
    assert.dom(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`).exists();

    const selectedRequest = this.element.querySelector(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`);
    const selectedRequestRejectBtn = selectedRequest.querySelector("[data-test-pending-request-reject-button]");
    await click(selectedRequestRejectBtn);

    assert.dom(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`).doesNotExist();
  });

  test('approve action should remove the request from pending list', async function(assert) {
    const rrsPending = this.server.createList("partner/registrationRequest", 5, { "approvalStatus": "pending" });
    const rrPendingObj = rrsPending[0];

    this.server.get('v2/partners/1/registration_requests', (schema, request) => {
      const is_activated = request.queryParams.is_activated;
      const status= request.queryParams.status;
      const data = schema["partner/registrationRequests"].where({
        isActivated: is_activated,
        approvalStatus: status
      });
      return registrationRequestSerializer(data, true)
    });

    this.server.patch('v2/partners/1/registration_requests/:id', (schema, request) => {
      const obj = schema["partner/registrationRequests"].find(request.params.id)
      const body = JSON.parse(request.requestBody);
      obj.update({
        'approvalStatus': body.approval_status,
      })
      return registrationRequestSerializer(obj);
    });

    this.server.get('v2/partners/1/registration_requests/:id', (schema, request) => {
      const obj = schema["partner/registrationRequests"].find(request.params.id)
      return registrationRequestSerializer(obj);
    });

    await render(hbs`<Partner::RegistrationRequestPendingList />`);
    assert.dom(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`).exists();

    const selectedRequest = this.element.querySelector(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`);
    const selectedRequestApproveBtn = selectedRequest.querySelector("[data-test-pending-request-approve-button]");
    await click(selectedRequestApproveBtn);

    assert.dom(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`).doesNotExist();
  });
});
