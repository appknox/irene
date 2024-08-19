import { module, test } from 'qunit';
import { visit, find, findAll, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import dayjs from 'dayjs';

import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';
import { ServiceAccountType } from 'irene/models/service-account';

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

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {}
}

module('Acceptance | Organization Service Account List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    // user created service accounts
    this.server.createList('service-account', 5, {
      service_account_type: ServiceAccountType.USER,
    });

    // system created service accounts
    this.server.createList('service-account', 3, {
      service_account_type: ServiceAccountType.SYSTEM,
    });

    this.server.createList('organization-user', 8);

    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      return schema.organizationUsers.find(req.params.userId).toJSON();
    });

    this.setProperties({
      getServiceAccounts: (accountType = 1) =>
        this.server.db.serviceAccounts.where({
          service_account_type: accountType,
        }),

      getUser: (userId) => this.server.db.organizationUsers.find(userId),

      organization,
      organizationMe: currentOrganizationMe,
    });
  });

  test.each(
    'it renders service accounts',
    [false, true],
    async function (assert, showSystemCreated) {
      // feature is enabled
      this.organization.update({
        features: {
          public_apis: true,
        },
      });

      // role set to owner
      this.organizationMe.update({
        is_owner: true,
        is_admin: true,
      });

      this.server.get('/service_accounts', (schema, req) => {
        const accountType = req.queryParams['service_account_type'];
        const serviceAccounts = schema.db.serviceAccounts;

        const results = accountType
          ? serviceAccounts.where({
              service_account_type: Number(accountType),
            })
          : serviceAccounts;

        return { previous: null, next: null, count: results.length, results };
      });

      let url = '/dashboard/organization/settings/service-account';

      if (showSystemCreated) {
        url = url.concat('?show_system_created=true');
      }

      await visit(url);

      assert
        .dom('[data-test-serviceAccountList-title]')
        .hasText(t('serviceAccountModule.listTitle'));

      assert
        .dom('[data-test-serviceAccountList-description]')
        .hasText(t('serviceAccountModule.listDescription'));

      assert
        .dom('[data-test-ak-form-label]')
        .hasText(t('serviceAccountModule.showSystemCreated'));

      assert
        .dom('[data-test-serviceAccountList-showSystemCreatedCheckbox]')
        [showSystemCreated ? 'isChecked' : 'isNotChecked']();

      assert
        .dom('[data-test-serviceAccountList-createBtn]')
        .isNotDisabled()
        .hasText(t('create'));

      const headerCells = findAll('[data-test-serviceAccountList-thead] th');

      assert.strictEqual(headerCells.length, 5);

      assert.dom(headerCells[0]).hasText(t('accountName'));
      assert.dom(headerCells[1]).hasText(t('accountID'));
      assert.dom(headerCells[2]).hasText(t('expiryOn'));
      assert.dom(headerCells[3]).hasText(t('createdBy'));
      assert.dom(headerCells[4]).hasText(t('action'));

      const rows = findAll('[data-test-serviceAccountList-row]');

      const serviceAccounts = showSystemCreated
        ? this.server.db.serviceAccounts
        : this.getServiceAccounts();

      assert.strictEqual(rows.length, serviceAccounts.length);

      // assert first row
      const firstRowCells = rows[0].querySelectorAll(
        '[data-test-serviceAccountList-cell]'
      );

      assert.dom(firstRowCells[0]).hasText(serviceAccounts[0].name);
      assert.dom(firstRowCells[1]).hasText(serviceAccounts[0].access_key_id);

      const createdByUser = this.getUser(serviceAccounts[0].created_by_user);

      assert.dom(firstRowCells[3]).hasText(createdByUser.username);
    }
  );

  test('test show system created checkbox change', async function (assert) {
    // feature is enabled
    this.organization.update({
      features: {
        public_apis: true,
      },
    });

    // role set to owner
    this.organizationMe.update({
      is_owner: true,
      is_admin: true,
    });

    this.server.get('/service_accounts', (schema, req) => {
      const accountType = req.queryParams['service_account_type'];
      const serviceAccounts = schema.db.serviceAccounts;

      const results = accountType
        ? serviceAccounts.where({
            service_account_type: Number(accountType),
          })
        : serviceAccounts;

      return { previous: null, next: null, count: results.length, results };
    });

    await visit('/dashboard/organization/settings/service-account');

    assert
      .dom('[data-test-serviceAccountList-showSystemCreatedCheckbox]')
      .isNotChecked();

    // check show system created
    await click('[data-test-serviceAccountList-showSystemCreatedCheckbox]');

    assert
      .dom('[data-test-serviceAccountList-showSystemCreatedCheckbox]')
      .isChecked();

    assert.strictEqual(
      currentURL(),
      '/dashboard/organization/settings/service-account?show_system_created=true'
    );

    let rows = findAll('[data-test-serviceAccountList-row]');
    let serviceAccounts = this.server.db.serviceAccounts;

    assert.strictEqual(rows.length, serviceAccounts.length);

    // uncheck show system created
    await click('[data-test-serviceAccountList-showSystemCreatedCheckbox]');

    assert
      .dom('[data-test-serviceAccountList-showSystemCreatedCheckbox]')
      .isNotChecked();

    assert.strictEqual(
      currentURL(),
      '/dashboard/organization/settings/service-account'
    );

    rows = findAll('[data-test-serviceAccountList-row]');
    serviceAccounts = this.getServiceAccounts();

    assert.strictEqual(rows.length, serviceAccounts.length);
  });

  test.each(
    'it renders expiry chip correctly',
    [{ noExpiry: true, expired: false }, { expired: false }, { expired: true }],
    async function (assert, { expired, noExpiry }) {
      // feature is enabled
      this.organization.update({
        features: {
          public_apis: true,
        },
      });

      // role set to owner
      this.organizationMe.update({
        is_owner: true,
        is_admin: true,
      });

      const serviceAccounts = this.getServiceAccounts();

      this.server.db.serviceAccounts.update(serviceAccounts[0].id, {
        is_expired: expired,
        ...(noExpiry ? { expiry: null } : {}),
      });

      this.server.get('/service_accounts', (schema) => {
        const serviceAccounts = schema.db.serviceAccounts;

        const results = serviceAccounts.where({
          service_account_type: 1,
        });

        return { previous: null, next: null, count: results.length, results };
      });

      await visit('/dashboard/organization/settings/service-account');

      const rows = findAll('[data-test-serviceAccountList-row]');

      assert.strictEqual(rows.length, serviceAccounts.length);

      const firstRowCells = rows[0].querySelectorAll(
        '[data-test-serviceAccountList-cell]'
      );

      assert
        .dom('[data-test-serviceAccountList-expiresOnChip]', firstRowCells[2])
        .hasText(
          noExpiry
            ? t('noExpiry')
            : dayjs(serviceAccounts[0].expiry).format('DD MMM YYYY')
        );
    }
  );

  test.each(
    'test delete action for a service account',
    [true, false],
    async function (assert, fail) {
      // feature is enabled
      this.organization.update({
        features: {
          public_apis: true,
        },
      });

      // role set to owner
      this.organizationMe.update({
        is_owner: true,
        is_admin: true,
      });

      const serviceAccounts = this.getServiceAccounts();
      const errorMsg = 'Service account delete failed';

      this.server.get('/service_accounts', (schema) => {
        const serviceAccounts = schema.db.serviceAccounts;

        const results = serviceAccounts.where({
          service_account_type: 1,
        });

        return { previous: null, next: null, count: results.length, results };
      });

      this.server.delete('/service_accounts/:id', (schema, req) => {
        if (fail) {
          return new Response(502, {}, { detail: errorMsg });
        }

        schema.db.serviceAccounts.remove(req.params.id);

        return new Response(204);
      });

      await visit('/dashboard/organization/settings/service-account');

      let rows = findAll('[data-test-serviceAccountList-row]');

      assert.strictEqual(rows.length, serviceAccounts.length);

      const firstRowCells = rows[0].querySelectorAll(
        '[data-test-serviceAccountList-cell]'
      );

      const moreOptionBtn = firstRowCells[4].querySelector(
        '[data-test-serviceAccountList-moreOptionBtn]'
      );

      assert.dom(moreOptionBtn).isNotDisabled();

      // open more options menu
      await click(moreOptionBtn);

      const deleteOption = `[data-test-serviceAccountList-moreOptionMenuItem="${t('delete')}"] button`;

      assert.dom(deleteOption).isNotDisabled().hasText(t('delete'));

      await click(deleteOption);

      // confirm box should appear
      assert
        .dom('[data-test-serviceAccount-confirmDrawer-heading]')
        .hasText(t('confirmation'));

      assert.strictEqual(
        find(
          '[data-test-serviceAccount-confirmDrawer-description]'
        ).innerHTML.trim(),
        t('serviceAccountModule.deleteConfirmText', {
          name: serviceAccounts[0].name,
        })
      );

      assert
        .dom('[data-test-serviceAccount-confirmDrawer-confirmBtn]')
        .isNotDisabled()
        .hasText(t('delete'));

      assert
        .dom('[data-test-serviceAccount-confirmDrawer-cancelBtn]')
        .isNotDisabled()
        .hasText(t('cancel'));

      await click('[data-test-serviceAccount-confirmDrawer-confirmBtn]');

      rows = findAll('[data-test-serviceAccountList-row]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, errorMsg);
        assert.strictEqual(rows.length, serviceAccounts.length);

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-heading]')
          .hasText(t('confirmation'));

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-confirmBtn]')
          .isNotDisabled();

        assert.dom('[data-test-serviceAccount-confirmDrawer-cancelBtn]');
      } else {
        assert.strictEqual(
          notify.successMsg,
          t('serviceAccountModule.deleteSuccessMsg')
        );

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-heading]')
          .doesNotExist();

        assert.strictEqual(rows.length, serviceAccounts.length - 1);
      }
    }
  );

  test('it should navigate to service account details page', async function (assert) {
    // feature is enabled
    this.organization.update({
      features: {
        public_apis: true,
      },
    });

    // role set to owner
    this.organizationMe.update({
      is_owner: true,
      is_admin: true,
    });

    const serviceAccounts = this.getServiceAccounts();

    this.server.get('/service_accounts', (schema) => {
      const serviceAccounts = schema.db.serviceAccounts;

      const results = serviceAccounts.where({
        service_account_type: 1,
      });

      return { previous: null, next: null, count: results.length, results };
    });

    this.server.get('/service_accounts/:id', (schema, req) => {
      return schema.serviceAccounts.find(req.params.id)?.toJSON();
    });

    await visit('/dashboard/organization/settings/service-account');

    let rows = findAll('[data-test-serviceAccountList-row]');

    assert.strictEqual(rows.length, serviceAccounts.length);

    const firstRowCells = rows[0].querySelectorAll(
      '[data-test-serviceAccountList-cell]'
    );

    const viewDetailsLink = firstRowCells[4].querySelector(
      '[data-test-serviceAccountList-viewDetailsLink]'
    );

    assert.dom(viewDetailsLink).exists();

    await click(viewDetailsLink);

    assert.strictEqual(
      currentURL(),
      `/dashboard/organization/settings/service-account/${serviceAccounts[0].id}`
    );
  });

  test('it renders empty state for service accounts', async function (assert) {
    // feature is enabled
    this.organization.update({
      features: {
        public_apis: true,
      },
    });

    // role set to owner
    this.organizationMe.update({
      is_owner: true,
      is_admin: true,
    });

    this.server.get('/service_accounts', () => {
      return { previous: null, next: null, count: 0, results: [] };
    });

    await visit('/dashboard/organization/settings/service-account');

    assert.dom('[data-test-serviceAccount-emptySvg]').exists();

    assert
      .dom('[data-test-serviceAccount-emptyTitle]')
      .hasText(t('serviceAccountModule.emptyTitle'));

    assert.strictEqual(
      find('[data-test-serviceAccount-emptyDescription]').innerHTML.trim(),
      t('serviceAccountModule.emptyDescription')
    );
  });

  test.each(
    'it redirects to projects page if feature is disabled or user does not have access',
    [{ featureNotEnabled: true }, { userHasNoAccess: true }],
    async function (assert) {
      if (this.featureNotEnabled) {
        this.organization.update({
          features: {
            public_apis: false,
          },
        });
      }

      if (this.userHasNoAccess) {
        this.organizationMe.update({
          is_owner: false,
          is_admin: false,
          is_member: true,
        });
      }

      this.server.get('/organizations/:id/projects', () => {
        return { previous: null, next: null, count: 0, results: [] };
      });

      await visit('/dashboard/organization/settings/service-account');

      assert.strictEqual(currentURL(), '/dashboard/projects');
    }
  );
});
