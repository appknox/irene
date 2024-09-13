/* eslint-disable qunit/no-assert-equal */
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
      results: data.models.map((d) => d.toJSON()),
    };
  }

  return data.toJSON();
}

module(
  'Integration | Component | partner/registration-request-pending-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:organization', OrganizationStub);
      this.owner.register('service:realtime', RealtimeStub);
    });

    test('it renders translated section title', async function (assert) {
      await render(hbs`<Partner::RegistrationRequestPendingList />`);

      assert.dom('[data-test-pending-requests-title]').exists();

      assert
        .dom('[data-test-pending-requests-title]')
        .hasText('Pending Registration Requests');
    });

    test('it renders loading error on data fetch error', async function (assert) {
      this.server.get('v2/partners/1/registration_requests', () => {
        return new Response(500);
      });

      await render(hbs`<Partner::RegistrationRequestPendingList />`);

      assert.dom('[data-test-pending-requests-loading-error]').exists();
      assert.dom('[data-test-pending-requests-loader]').doesNotExist();
      assert.dom('[data-test-pending-requests-list]').doesNotExist();
    });

    test('it renders empty state', async function (assert) {
      this.server.get('v2/partners/1/registration_requests', () => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      });

      await render(hbs`<Partner::RegistrationRequestPendingList />`);

      assert.dom('[data-test-pending-requests-empty]').exists();

      assert
        .dom('[data-test-pending-requests-empty]')
        .hasText('No pending requests');

      assert.dom('[data-test-pending-requests-list]').doesNotExist();
    });

    test('it should not render loading indicator or error once data is loaded', async function (assert) {
      this.server.get('v2/partners/1/registration_requests', () => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      });

      await render(hbs`<Partner::RegistrationRequestPendingList />`);

      assert.dom('[data-test-pending-requests-loader]').doesNotExist();
      assert.dom('[data-test-pending-requests-loading-error]').doesNotExist();
      assert.dom('[data-test-pending-requests-empty]').exists();
    });

    test('it renders table header for pending requests', async function (assert) {
      this.server.createList('partner/registration-request', 1, {
        approval_status: 'pending',
      });

      this.server.get(
        'v2/partners/:id/registration_requests',
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

      await render(hbs`<Partner::RegistrationRequestPendingList />`);

      assert.dom('[data-test-pending-requests-table-header]').exists();

      const header = this.element.querySelector(
        '[data-test-pending-requests-table-header]'
      );

      assert.true(header.children[0].textContent.trim().includes('Requested'));
      assert.true(header.children[0].textContent.trim().includes('by'));
      assert.strictEqual(header.children[1].textContent.trim(), 'Company');
      assert.strictEqual(header.children[2].textContent.trim(), 'Requested');
      assert.strictEqual(header.children[3].textContent.trim(), '');
    });

    test('it does not render table header for empty state', async function (assert) {
      this.server.get('v2/partners/1/registration_requests', () => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      });

      await render(hbs`<Partner::RegistrationRequestPendingList />`);

      assert.dom('[data-test-pending-requests-table-header]').doesNotExist();
      assert.dom('[data-test-pending-requests-empty]').exists();
    });

    test('it renders pending registrations requests list', async function (assert) {
      this.server.createList('partner/registration-request', 5, {
        approval_status: 'pending',
      });

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

      await render(hbs`<Partner::RegistrationRequestPendingList />`);

      assert.dom('[data-test-pending-requests-list]').exists();

      const rows = this.element.querySelectorAll(
        '[data-test-pending-request-row]'
      );

      assert.strictEqual(rows.length, 5);
      assert.dom('[data-test-pending-requests-empty]').doesNotExist();
      assert.dom('[data-test-pending-requests-list]').exists();
    });

    test('rejection action should remove the request from pending list', async function (assert) {
      const rrsPending = this.server.createList(
        'partner/registrationRequest',
        5,
        { approval_status: 'pending' }
      );

      const rrPendingObj = rrsPending[0];

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

      this.server.patch(
        'v2/partners/1/registration_requests/:id',
        (schema, request) => {
          const obj = schema['partner/registrationRequests'].find(
            request.params.id
          );

          const body = JSON.parse(request.requestBody);

          obj.update({
            approval_status: body.approval_status,
          });

          return registrationRequestSerializer(obj);
        }
      );

      this.server.get(
        'v2/partners/1/registration_requests/:id',
        (schema, request) => {
          const obj = schema['partner/registrationRequests'].find(
            request.params.id
          );

          return registrationRequestSerializer(obj);
        }
      );

      await render(hbs`<Partner::RegistrationRequestPendingList />`);

      assert
        .dom(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`)
        .exists();

      const selectedRequest = this.element.querySelector(
        `[data-test-pending-request-id='${rrPendingObj.attrs.id}']`
      );

      const selectedRequestRejectBtn = selectedRequest.querySelector(
        '[data-test-pending-request-reject-button]'
      );

      await click(selectedRequestRejectBtn);

      assert
        .dom(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`)
        .doesNotExist();
    });

    test('approve action should remove the request from pending list', async function (assert) {
      const rrsPending = this.server.createList(
        'partner/registrationRequest',
        5,
        { approval_status: 'pending' }
      );

      const rrPendingObj = rrsPending[0];

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

      this.server.patch(
        'v2/partners/1/registration_requests/:id',
        (schema, request) => {
          const obj = schema['partner/registrationRequests'].find(
            request.params.id
          );

          const body = JSON.parse(request.requestBody);

          obj.update({
            approval_status: body.approval_status,
          });

          return registrationRequestSerializer(obj);
        }
      );

      this.server.get(
        'v2/partners/1/registration_requests/:id',
        (schema, request) => {
          const obj = schema['partner/registrationRequests'].find(
            request.params.id
          );

          return registrationRequestSerializer(obj);
        }
      );

      await render(hbs`<Partner::RegistrationRequestPendingList />`);

      assert
        .dom(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`)
        .exists();

      const selectedRequest = this.element.querySelector(
        `[data-test-pending-request-id='${rrPendingObj.attrs.id}']`
      );

      const selectedRequestApproveBtn = selectedRequest.querySelector(
        '[data-test-pending-request-approve-button]'
      );

      await click(selectedRequestApproveBtn);

      assert
        .dom(`[data-test-pending-request-id='${rrPendingObj.attrs.id}']`)
        .doesNotExist();
    });
  }
);
