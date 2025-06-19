import { visit, click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';

import { assertBreadcrumbsUI } from 'irene/tests/helpers/breadcrumbs-utils';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

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

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }

  setDefaultAutoClear() {}
}

module('Acceptance | breadcrumbs/organization-settings', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    const { organization } = await setupRequiredEndpoints(this.server);

    organization.update({
      features: {
        public_apis: true,
      },
    });

    this.server.create('service-account');

    this.server.get('/service_accounts', (schema) => {
      const results = schema.serviceAccounts.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/service_accounts/:id', (schema, req) => {
      return schema.serviceAccounts.find(req.params.id).toJSON();
    });
  });

  test('it checks organization settings breadcrumbs', async function (assert) {
    assert.expect();

    await visit(`/dashboard/organization/namespaces`);

    assert.dom('[data-test-org-name-action-btn]').exists();

    await click('[data-test-org-name-action-btn]');

    assertBreadcrumbsUI([t('organization'), t('settings')], assert);
  });

  test('it checks organization settings all tabs breadcrumbs', async function (assert) {
    assert.expect();

    await visit(`/dashboard/organization/settings`);

    assertBreadcrumbsUI([t('organization'), t('settings')], assert);

    await click(
      '[data-test-organization-settingsWrapper-tabs="integrations-tab"] a'
    );

    assertBreadcrumbsUI(
      [t('organization'), t('settings'), t('integration')],
      assert
    );

    await click(
      '[data-test-organization-settingswrapper-tabs="service-account-tab"] a'
    );

    assertBreadcrumbsUI(
      [t('organization'), t('settings'), t('serviceAccount')],
      assert
    );
  });

  test('it checks service account create breadcrumbs', async function (assert) {
    assert.expect();

    await visit(`/dashboard/organization/settings`);

    await click(
      '[data-test-organization-settingsWrapper-tabs="service-account-tab"] a'
    );

    assertBreadcrumbsUI(
      [t('organization'), t('settings'), t('serviceAccount')],
      assert
    );

    await click('[data-test-serviceaccountlist-createbtn]');

    assertBreadcrumbsUI(
      [t('organization'), t('settings'), t('serviceAccount'), t('create')],
      assert
    );
  });

  test('it checks service account duplicate breadcrumbs', async function (assert) {
    assert.expect();

    await visit(`/dashboard/organization/settings`);

    await click(
      '[data-test-organization-settingsWrapper-tabs="service-account-tab"] a'
    );

    assertBreadcrumbsUI(
      [t('organization'), t('settings'), t('serviceAccount')],
      assert
    );

    await click('[data-test-serviceaccountlist-moreoptionbtn]');

    await click(
      '[data-test-serviceaccountlist-moreoptionmenuitem="Duplicate"] a'
    );

    assertBreadcrumbsUI(
      [t('organization'), t('settings'), t('serviceAccount'), t('create')],
      assert
    );
  });

  test('it checks service account view breadcrumbs', async function (assert) {
    assert.expect();

    await visit(`/dashboard/organization/settings`);

    await click(
      '[data-test-organization-settingsWrapper-tabs="service-account-tab"] a'
    );

    assertBreadcrumbsUI(
      [t('organization'), t('settings'), t('serviceAccount')],
      assert
    );

    await click('[data-test-serviceaccountlist-viewdetailslink]');

    assertBreadcrumbsUI(
      [t('organization'), t('settings'), t('serviceAccount'), t('viewOrEdit')],
      assert
    );

    //Duplicate from View/Edit
    await click('[data-test-serviceaccountdetails-moreoptionsbtn]');

    await click(
      '[data-test-serviceaccountlist-moreoptionmenuitem="Duplicate"] a'
    );

    assertBreadcrumbsUI(
      [
        t('organization'),
        t('settings'),
        t('serviceAccount'),
        t('viewOrEdit'),
        t('create'),
      ],
      assert
    );
  });
});
