import { module, test } from 'qunit';
import { visit, findAll, find, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module('Acceptance | storeknox/discovery/requested-apps', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    organization.update({
      features: {
        storeknox: true,
      },
    });

    this.setProperties({ currentOrganizationMe });
  });

  test('it renders empty state when no app exists', async function (assert) {
    assert.expect(4);

    this.currentOrganizationMe.update({ is_owner: false });

    // Server mocks
    this.server.get('v2/sk_requested_apps', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    await visit('/dashboard/storeknox/discover/requested');

    assert
      .dom('[data-test-storeknoxDiscover-requestedAppsTable-tableEmpty]')
      .exists();

    assert
      .dom(
        '[data-test-storeknoxDiscover-requestedAppsTable-tableEmptyHeaderText]'
      )
      .exists()
      .containsText(t('storeknox.noRequestedAppsFound'));

    compareInnerHTMLWithIntlTranslation(assert, {
      selector:
        '[data-test-storeknoxDiscover-requestedAppsTable-tableEmptyHeaderDescription]',
      message: t('storeknox.noRequestedAppsFoundDescription'),
    });
  });

  test.each(
    'it renders requested apps and their correct statuses',
    [{ approved: true }, { pending_approval: true }, { rejected: true }],
    async function (assert, { approved, rejected }) {
      const pending_approval = !approved && !rejected;

      // Models/Test variables
      this.currentOrganizationMe.update({ is_owner: false });

      const skRequestedApp = this.server.create(
        'sk-requested-app',
        approved
          ? 'withApproval'
          : rejected
            ? 'withRejection'
            : 'withPendingApproval'
      );

      // Server mocks
      this.server.get('v2/sk_requested_apps', (schema) => {
        const requestedApps = schema.skRequestedApps.all().models.map((a) => ({
          ...a.toJSON(),
          app_metadata: a.app_metadata,
        }));

        return {
          count: requestedApps.length,
          next: null,
          previous: null,
          results: requestedApps,
        };
      });

      await visit('/dashboard/storeknox/discover/requested');

      const appElementList = findAll(
        '[data-test-storeknoxDiscover-requestedAppsTable-row]'
      );

      // Contains the right number of apps
      assert.strictEqual(appElementList.length, 1);

      // Sanity check for requested app
      const srElement = find(
        `[data-test-storeknoxDiscover-requestedAppsTable-rowId='${skRequestedApp.id}']`
      );

      const skRequestedAppMetaData = skRequestedApp.app_metadata;

      assert
        .dom(srElement)
        .exists()
        .containsText(skRequestedAppMetaData.title)
        .containsText(skRequestedAppMetaData.dev_email)
        .containsText(skRequestedAppMetaData.dev_name);

      assert
        .dom('[data-test-applogo-img]', srElement)
        .exists()
        .hasAttribute('src', skRequestedAppMetaData.icon_url);

      if (skRequestedAppMetaData.platform === ENUMS.PLATFORM.ANDROID) {
        assert
          .dom(
            '[data-test-storeknoxTableColumns-store-playStoreIcon]',
            srElement
          )
          .exists();
      }

      if (skRequestedAppMetaData.platform === ENUMS.PLATFORM.IOS) {
        assert
          .dom('[data-test-storeknoxTableColumns-store-iosIcon]', srElement)
          .exists();
      }

      if (pending_approval) {
        assert
          .dom(
            '[data-test-storeknoxDiscover-requestedAppsTable-row-waitingForApprovalChip]'
          )
          .exists()
          .containsText(t('storeknox.waitingForApproval'));

        assert
          .dom(
            '[data-test-storeknoxDiscover-requestedAppsTable-row-waitingForApprovalChipIcon]'
          )
          .exists();
      } else {
        assert
          .dom(
            '[data-test-storeknoxDiscover-requestedAppsTable-row-approvalOrRejectedInfoContainer]'
          )
          .exists()
          .containsText(t(approved ? 'storeknox.approved' : 'rejected'));

        assert
          .dom(
            '[data-test-storeknoxDiscover-requestedAppsTable-row-approvalOrRejectedUserInfo]'
          )
          .exists()
          .containsText(t('by'))
          .containsText(
            approved ? skRequestedApp.approved_by : skRequestedApp.rejected_by
          );

        // Check for approved/rejected date on tooltip

        const tooltipSelector =
          '[data-test-storeknoxDiscover-requestedAppsTable-row-approvalOrRejectedDateTooltipIcon]';

        const approveOrRejectedDateTooltipTriggerElement =
          find(tooltipSelector);

        const tooltipContentSelector = '[data-test-ak-tooltip-content]';

        assert.dom(tooltipSelector).exists();

        await triggerEvent(
          approveOrRejectedDateTooltipTriggerElement,
          'mouseenter'
        );

        assert
          .dom(tooltipContentSelector)
          .exists()
          .hasText(
            dayjs(
              approved ? skRequestedApp.approved_on : skRequestedApp.rejected_on
            ).format('MMMM D, YYYY, HH:mm')
          );

        await triggerEvent(
          approveOrRejectedDateTooltipTriggerElement,
          'mouseleave'
        );
      }
    }
  );
});
