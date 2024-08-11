import { module, test } from 'qunit';
import { visit, find, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';

import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';

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

module('Acceptance | Organization Service Account Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    const serviceAccounts = this.server.createList('service-account', 5);

    serviceAccounts.forEach((it) => {
      this.server.create('organization-user', {
        id: it.created_by_user,
      });
    });

    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.setProperties({
      serviceAccount: serviceAccounts[0],
      organization,
      organizationMe: currentOrganizationMe,
    });
  });

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

      const errorMsg = 'Service account delete failed';

      this.server.get('/service_accounts', (schema) => {
        const serviceAccounts = schema.db.serviceAccounts;

        const results = serviceAccounts.where({
          service_account_type: 1,
        });

        return { previous: null, next: null, count: results.length, results };
      });

      this.server.get('/service_accounts/:id', (schema, req) => {
        return schema.serviceAccounts.find(req.params.id).toJSON();
      });

      this.server.delete('/service_accounts/:id', (schema, req) => {
        if (fail) {
          return new Response(502, {}, { detail: errorMsg });
        }

        schema.db.serviceAccounts.remove(req.params.id);

        return new Response(204);
      });

      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        return schema.organizationUsers.find(req.params.userId).toJSON();
      });

      await visit(
        `/dashboard/organization/settings/service-account/${this.serviceAccount.id}`
      );

      assert
        .dom('[data-test-serviceAccountDetails-breadcrumbContainer]')
        .exists();

      assert
        .dom('[data-test-serviceAccountDetails-title]')
        .hasText(t('serviceAccountModule.detailsTitle'));

      assert
        .dom('[data-test-serviceAccountDetails-description]')
        .hasText(t('serviceAccountModule.detailsDescription'));

      assert
        .dom('[data-test-serviceAccountDetails-moreOptionsBtn]')
        .isNotDisabled();

      assert
        .dom('[data-test-serviceAccountDetails-moreOptionsBtn]')
        .isNotDisabled();

      // open more options menu
      await click('[data-test-serviceAccountDetails-moreOptionsBtn]');

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
          name: this.serviceAccount.name,
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

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, errorMsg);

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-heading]')
          .hasText(t('confirmation'));

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-confirmBtn]')
          .isNotDisabled();

        assert.dom('[data-test-serviceAccount-confirmDrawer-cancelBtn]');

        assert.strictEqual(
          currentURL(),
          `/dashboard/organization/settings/service-account/${this.serviceAccount.id}`
        );
      } else {
        assert.strictEqual(
          notify.successMsg,
          t('serviceAccountModule.deleteSuccessMsg')
        );

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-heading]')
          .doesNotExist();

        assert.strictEqual(
          currentURL(),
          '/dashboard/organization/settings/service-account'
        );
      }
    }
  );

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

      await visit(
        `/dashboard/organization/settings/service-account/${this.serviceAccount.id}`
      );

      assert.strictEqual(currentURL(), '/dashboard/projects');
    }
  );
});
