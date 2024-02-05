import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';

import styles from 'irene/components/partner/clients-nav/index.scss';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
}

module('Acceptance | partner/clients nav', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { currentOrganizationMe } = await setupRequiredEndpoints(this.server);

    currentOrganizationMe.update({
      can_access_partner_dashboard: true,
    });

    const partner = this.server.create('partner/partner');

    this.server.createList('partner/partnerclient', 2);
    this.server.createList('partner/registration-request', 15);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.server.get('/v2/partners/:id', (schema) => {
      return schema['partner/partners'].first()?.toJSON();
    });

    this.server.get('/v2/partnerclients', (schema) => {
      const results = schema['partner/partnerclients'].all().models;

      return {
        count: results.length,
        previous: null,
        next: null,
        results,
      };
    });

    this.server.get('/v2/partners/:id/registration_requests', (schema, req) => {
      const status = req.queryParams.approval_status;

      const results = schema['partner/registrationRequests'].where(
        (it) => it.approval_status === status
      ).models;

      return {
        count: results.length,
        previous: null,
        next: null,
        results,
      };
    });

    this.setProperties({
      partner,
    });
  });

  test('it should render overview & invitations tabs always', async function (assert) {
    await visit('/partner/clients/overview');

    assert.dom('[data-test-clients-nav]').exists();

    assert.dom('[data-test-nav-tab="overview"]').exists();
    assert.dom('[data-test-nav-tab="invitations"]').exists();

    assert.dom('[data-test-nav-tab="overview"]').hasText(t('overview'));
    assert.dom('[data-test-nav-tab="invitations"]').hasText(t('invitations'));
  });

  test('it should not render registration requests tab if admin_registration privilege is false', async function (assert) {
    this.partner.update({
      access: {
        admin_registration: false,
      },
    });

    await visit('/partner/clients/overview');

    assert.dom('[data-test-nav-tab="registration-requests"]').doesNotExist();
  });

  test('it should render registration requests tab if admin_registration privilege is true', async function (assert) {
    this.partner.update({
      access: {
        admin_registration: true,
      },
    });

    await visit('/partner/clients/overview');

    assert.dom('[data-test-nav-tab="registration-requests"]').exists();

    assert
      .dom('[data-test-nav-tab="registration-requests"]')
      .hasText(t('registrationRequests'));
  });

  test('it should activate tab of current route', async function (assert) {
    this.partner.update({
      access: {
        admin_registration: true,
      },
    });

    // current route: overview
    await visit('/partner/clients/overview');

    assert.dom('[data-test-nav-tab="overview"]').hasClass(styles['active']);
    assert.strictEqual(currentURL(), '/partner/clients/overview');

    // current route: invitations
    await visit('/partner/clients/invitations');

    assert.dom('[data-test-nav-tab="invitations"]').hasClass(styles['active']);
    assert.strictEqual(currentURL(), '/partner/clients/invitations');

    // current route: registration-requests
    await visit('/partner/clients/registration-requests');

    assert
      .dom('[data-test-nav-tab="registration-requests"]')
      .hasClass(styles['active']);

    assert.strictEqual(currentURL(), '/partner/clients/registration-requests');
  });
});
