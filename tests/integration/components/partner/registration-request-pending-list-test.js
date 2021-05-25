import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';


module('Integration | Component | partner/registration-request-pending-list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('it renders translated section title', async function(assert) {
    await render(hbs`<Partner::RegistrationRequestPendingList />`);
    assert.dom("[data-test-pending-requests-title]").exists();
    assert.dom("[data-test-pending-requests-title]").hasText("t:pendingRequests:()");
  });

  test('it renders loading error on data fetch error', async function(assert) {
    this.server.get('v2/registration_requests', () => {
      return new Response(500);
    });
    await render(hbs`<Partner::RegistrationRequestPendingList />`);
    assert.dom("[data-test-pending-requests-loading-error]").exists();
    assert.dom("[data-test-pending-requests-loader]").doesNotExist();
    assert.dom("[data-test-pending-requests-list]").doesNotExist();
  });

  test('it renders empty state', async function(assert) {
    this.server.get('v2/registration_requests', () => {
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
    this.server.get('v2/registration_requests', () => {
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
    this.server.get('v2/registration_requests', () => {
      return {
        "count": 1,
        "next": null,
        "previous": null,
        "results": [
          {
            "id": 1,
            "email": "test1@test.test",
            "data": {
              "company": "TestCompany1",
              "first_name":"Test1"
            },
            "created_on": "2020-05-22T15:08:18.008097Z",
            "updated_on": "2021-03-24T18:02:22.481033Z",
            "valid_until": "2022-05-31T17:48:58.330920Z",
            "approval_status": "pending",
            "source": "registration",
            "moderated_by": 2,
            "is_activated": false
          }
        ]
      };
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
    this.server.get('v2/registration_requests', () => {
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
    this.server.get('v2/registration_requests', () => {
      return {
        "count": 2,
        "next": null,
        "previous": null,
        "results":[
          {
            "id": 2,
            "email": "test2@test.test",
            "data": {
              "company": "TestCompany2",
              "first_name":"Test2"
            },
            "created_on": "2021-05-22T15:08:18.008097Z",
            "updated_on": "2021-05-24T18:02:22.481033Z",
            "valid_until": "2021-05-31T17:48:58.330920Z",
            "approval_status": "pending",
            "source": "registration",
            "moderated_by": 2,
            "is_activated": false
          },
          {
            "id": 1,
            "email": "test1@test.test",
            "data": {
              "company": "TestCompany1",
              "first_name":"Test1"
            },
            "created_on": "2020-05-22T15:08:18.008097Z",
            "updated_on": "2021-03-24T18:02:22.481033Z",
            "valid_until": "2022-05-31T17:48:58.330920Z",
            "approval_status": "pending",
            "source": "registration",
            "moderated_by": 2,
            "is_activated": false
          }
        ]
      };
    });
    await render(hbs`<Partner::RegistrationRequestPendingList />`);
    assert.dom("[data-test-pending-requests-list]").exists();
    const rows = this.element.querySelectorAll("[data-test-pending-request-row]");
    assert.equal(rows.length, 2)
    assert.dom("[data-test-pending-requests-empty]").doesNotExist();
    assert.dom("[data-test-pending-requests-list]").exists();
  });
});
