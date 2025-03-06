import { visit, findAll, find, triggerEvent, click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';
import dayjs from 'dayjs';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import ENUMS from 'irene/enums';

// Notification Service
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

module('Acceptance | storeknox/inventory/pending-review', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    // Models
    organization.update({
      features: {
        storeknox: true,
      },
    });

    currentOrganizationMe.update({ is_owner: true });

    this.server.create('sk-organization');

    // Services
    this.owner.register('service:notifications', NotificationsStub);

    this.setProperties({ currentOrganizationMe });
  });

  test('it renders with empty state', async function (assert) {
    this.server.create('sk-organization');

    // Server mocks
    this.server.get('/v2/sk_app', () => {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    });

    this.server.get('/v2/sk_organization', (schema) => {
      const skOrganizations = schema.skOrganizations.all().models;

      return {
        count: skOrganizations.length,
        next: null,
        previous: null,
        results: skOrganizations,
      };
    });

    // Test start
    await visit('/dashboard/storeknox/inventory/pending-reviews');

    assert
      .dom('[data-test-storeknoxInventory-pendingReviewEmptyIllustration]')
      .exists();

    assert
      .dom('[data-test-storeknoxInventory-pendingReviewEmptyHeaderText]')
      .hasText(t('storeknox.noPendingItems'));

    assert
      .dom('[data-test-storeknoxInventory-pendingReviewEmptyDescriptionText]')
      .hasText(t('storeknox.noPendingItemsDescription'));
  });

  test.each(
    'it renders with pending review apps',
    [
      {
        manual_discovery: true,
        app_source: ENUMS.SK_DISCOVERY.MANUAL,
      },
      {
        auto_discovery: true,
        app_source: ENUMS.SK_DISCOVERY.AUTO,
      },
    ],
    async function (assert, { manual_discovery, app_source }) {
      // Models
      const added_by = this.server.create('organization-user');

      const pendingReviewApp = this.server.create(
        'sk-app',
        {
          app_source,
          added_by: manual_discovery ? added_by.id : null,
        },
        'withPendingReviewStatus'
      );

      // Server mocks
      this.server.get('v2/sk_app', (schema, req) => {
        const { app_status, approval_status } = req.queryParams;

        const skApps = schema.skApps
          .where(
            (a) =>
              a.app_status === Number(app_status) &&
              a.approval_status === Number(approval_status)
          )
          .models.map((a) => ({
            ...a.toJSON(),
            app_metadata: a.app_metadata,
          }));

        return {
          count: skApps.length,
          next: null,
          previous: null,
          results: skApps,
        };
      });

      this.server.get('/v2/sk_organization', (schema) => {
        const skOrganizations = schema.skOrganizations.all().models;

        return {
          count: skOrganizations.length,
          next: null,
          previous: null,
          results: skOrganizations,
        };
      });

      // Test start
      await visit('/dashboard/storeknox/inventory/pending-reviews');

      const appElementList = findAll(
        '[data-test-storeknoxInventory-pendingReviewTable-row]'
      );

      // Contains the right number of apps
      assert.strictEqual(appElementList.length, 1);

      const metadata = pendingReviewApp.app_metadata;

      const prAppElement = find(
        `[data-test-storeknoxInventory-pendingReviewTable-rowId='${pendingReviewApp.id}']`
      );

      if (pendingReviewApp.platform === ENUMS.PLATFORM.ANDROID) {
        assert
          .dom(
            '[data-test-storeknoxTableColumns-store-playStoreIcon]',
            prAppElement
          )
          .exists();
      }

      if (pendingReviewApp.platform === ENUMS.PLATFORM.IOS) {
        assert
          .dom('[data-test-storeknoxTableColumns-store-iosIcon]', prAppElement)
          .exists();
      }

      assert
        .dom('[data-test-storeknoxTableColumns-applicationTitle]', prAppElement)
        .hasText(metadata.title);

      assert
        .dom(
          '[data-test-storeknoxTableColumns-applicationPackageName]',
          prAppElement
        )
        .hasText(metadata.package_name);

      assert
        .dom('[data-test-applogo-img]', prAppElement)
        .hasAttribute('src', metadata.icon_url);

      // Requester Checks
      if (manual_discovery) {
        assert
          .dom(
            '[data-test-storeknoxInventory-pendingReviewTable-requesterEmail]'
          )
          .hasText(added_by.email);
      } else {
        assert
          .dom(
            '[data-test-storeknoxInventory-pendingReviewTable-systemRequested]'
          )
          .hasText(t('system'));
      }

      // Check for needs action tooltip
      const tooltipTrigger =
        '[data-test-storeknoxInventory-pendingReviewTable-requestByInfoTrigger]';

      const requesterInfoTooltipTriggerElement = find(tooltipTrigger);
      const tooltipContentSelector = '[data-test-ak-tooltip-content]';

      await triggerEvent(requesterInfoTooltipTriggerElement, 'mouseenter');

      assert.dom(tooltipContentSelector).exists();

      assert
        .dom(
          '[data-test-storeknoxInventory-pendingReviewTable-requestedOnHeaderText]'
        )
        .hasText(t('requestedOn'));

      assert
        .dom('[data-test-storeknoxInventory-pendingReviewTable-addedOnDate]')
        .hasText(
          dayjs(pendingReviewApp.added_on).format('MMMM D, YYYY, HH:mm')
        );

      assert
        .dom(
          '[data-test-storeknoxInventory-pendingReviewTable-sourceOfRequestHeader]'
        )
        .hasText(t('type'));

      assert
        .dom(
          '[data-test-storeknoxInventory-pendingReviewTable-sourceOfRequest]'
        )
        .hasText(
          manual_discovery
            ? t('storeknox.manualDiscovery')
            : t('storeknox.autoDiscovery')
        );

      await triggerEvent(requesterInfoTooltipTriggerElement, 'mouseleave');

      // Approve/Reject Btns
      assert
        .dom('[data-test-storeknoxInventory-pendingReviewTable-approveBtn]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventory-pendingReviewTable-approveBtnIcon]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventory-pendingReviewTable-rejectBtn]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventory-pendingReviewTable-rejectBtnIcon]')
        .exists();
    }
  );

  test.each(
    'it rejects/accepts an app',
    [
      {
        reject: true,
        approval_status: ENUMS.SK_APPROVAL_STATUS.REJECTED,
        approval_status_display: 'REJECTED',
      },
      {
        accept: true,
        approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
        approval_status_display: 'APPROVED',
      },
    ],
    async function (
      assert,
      { reject, accept, approval_status, approval_status_display }
    ) {
      // Models
      const pendingReviewApps = this.server.createList(
        'sk-app',
        3,
        {
          added_by: this.server.create('organization-user').id,
        },
        'withPendingReviewStatus'
      );

      const appToRejectOrAccept = pendingReviewApps[0];

      // Server mocks
      this.server.get('v2/sk_app', (schema, req) => {
        const { app_status, approval_status } = req.queryParams;

        const skApps = schema.skApps
          .where(
            (a) =>
              a.app_status === Number(app_status) &&
              a.approval_status === Number(approval_status)
          )
          .models.map((a) => ({
            ...a.toJSON(),
            app_metadata: a.app_metadata,
          }));

        return {
          count: skApps.length,
          next: null,
          previous: null,
          results: skApps,
        };
      });

      this.server.get('/v2/sk_organization', (schema) => {
        const skOrganizations = schema.skOrganizations.all().models;

        return {
          count: skOrganizations.length,
          next: null,
          previous: null,
          results: skOrganizations,
        };
      });

      this.server.put(
        '/v2/sk_app/:id/update_approval_status',
        (schema, req) => {
          const reqBody = JSON.parse(req.requestBody);
          const skAppId = req.params.id;

          // Check if correct app is being rejected or approved
          assert.strictEqual(appToRejectOrAccept.id, skAppId);
          assert.strictEqual(reqBody.approval_status, Number(approval_status));

          // Update DB to reflect app update
          schema.db.skApps.update(`${req.params.id}`, {
            approval_status,
          });

          return {
            id: skAppId,
            approval_status: reqBody.approval_status,
            approval_status_display,
          };
        }
      );

      // Test start
      await visit('/dashboard/storeknox/inventory/pending-reviews');

      let pendingReviewAppElements = findAll(
        '[data-test-storeknoxInventory-pendingReviewTable-row]'
      );

      assert.strictEqual(
        pendingReviewAppElements.length,
        pendingReviewApps.length
      );

      const appToRejectOrAcceptElement = find(
        `[data-test-storeknoxInventory-pendingReviewTable-rowId='${appToRejectOrAccept.id}']`
      );

      // Reject an app
      if (reject) {
        assert
          .dom(
            '[data-test-storeknoxInventory-pendingReviewTable-rejectBtn]',
            appToRejectOrAcceptElement
          )
          .exists();

        assert
          .dom(
            '[data-test-storeknoxInventory-pendingReviewTable-rejectBtnIcon]',
            appToRejectOrAcceptElement
          )
          .exists();

        await click(
          appToRejectOrAcceptElement.querySelector(
            '[data-test-storeknoxInventory-pendingReviewTable-rejectBtn]'
          )
        );
      }

      // Approve an app
      if (accept) {
        assert
          .dom(
            '[data-test-storeknoxInventory-pendingReviewTable-approveBtn]',
            appToRejectOrAcceptElement
          )
          .exists();

        assert
          .dom(
            '[data-test-storeknoxInventory-pendingReviewTable-approveBtnIcon]',
            appToRejectOrAcceptElement
          )
          .exists();

        await click(
          appToRejectOrAcceptElement.querySelector(
            '[data-test-storeknoxInventory-pendingReviewTable-approveBtn]'
          )
        );
      }

      // Check list again
      pendingReviewAppElements = findAll(
        '[data-test-storeknoxInventory-pendingReviewTable-row]'
      );

      assert.strictEqual(
        pendingReviewAppElements.length,
        pendingReviewApps.length - 1
      );

      assert
        .dom(
          `[data-test-storeknoxInventory-pendingReviewTable-rowId='${appToRejectOrAccept.id}']`
        )
        .doesNotExist();

      // Check notification message
      const notify = this.owner.lookup('service:notifications');

      const appName = {
        appName: appToRejectOrAccept.app_metadata.title,
      };

      assert.strictEqual(
        notify.successMsg,
        reject
          ? t('storeknox.appRejected', appName)
          : t('storeknox.appAddedToInventory', appName)
      );
    }
  );
});
