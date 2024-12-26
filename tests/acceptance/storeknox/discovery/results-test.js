import {
  visit,
  findAll,
  find,
  triggerEvent,
  click,
  fillIn,
  waitUntil,
} from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { faker } from '@faker-js/faker';
import { Response } from 'miragejs';
import Service from '@ember/service';

import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';
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

module('Acceptance | storeknox/discovery/results', function (hooks) {
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

    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders with empty state', async function (assert) {
    await visit('dashboard/storeknox/discover/result');

    assert
      .dom('[data-test-storeknoxDiscover-header-infoTexts]')
      .exists()
      .containsText(t('storeknox.discoverHeader'))
      .containsText(t('storeknox.discoverDescription'));

    const tabItems = [
      {
        id: 'discovery-results',
        label: t('storeknox.discoveryResults'),
      },
      !this.currentOrganizationMe.is_admin && {
        id: 'requested-apps',
        label: t('storeknox.requestedApps'),
      },
    ].filter(Boolean);

    tabItems.forEach((tab) =>
      assert
        .dom(`[data-test-storeknox-discovery-tabs='${tab.id}-tab']`)
        .exists()
        .containsText(tab.label)
    );

    assert
      .dom('[data-test-storeknoxDiscover-results-searchQueryInput]')
      .exists();

    assert
      .dom('[data-test-storeknoxDiscover-results-searchClearIcon]')
      .doesNotExist();

    assert.dom('[data-test-storeknoxDiscover-results-searchIcon]').exists();

    assert
      .dom('[data-test-storeknoxDiscover-results-searchTrigger]')
      .exists()
      .containsText(t('storeknox.discoverHeader'));

    assert
      .dom('[data-test-storeknoxDiscover-results-disclaimerInfoSection]')
      .exists()
      .containsText(t('storeknox.disclaimer'))
      .containsText(t('storeknox.disclaimerHeader'));

    assert
      .dom('[data-test-storeknoxDiscover-results-disclaimerInfoWarningIcon]')
      .exists();

    assert
      .dom('[data-test-storeknoxDiscover-results-viewMoreDisclaimerInfo]')
      .exists()
      .containsText(t('viewMore'));

    assert
      .dom('[data-test-storeknoxDiscover-resultsEmptyIllustration]')
      .exists();

    assert
      .dom('[data-test-storeknoxDiscover-resultsEmptyContainer]')
      .exists()
      .containsText(t('storeknox.searchForApps'))
      .containsText(t('storeknox.searchForAppsDescription'));
  });

  test('it opens and closes diclaimer modal', async function (assert) {
    assert.expect(12);

    await visit('dashboard/storeknox/discover/result');

    assert
      .dom('[data-test-storeknoxDiscover-results-searchQueryInput]')
      .exists();

    assert
      .dom('[data-test-storeknoxDiscover-results-viewMoreDisclaimerInfo]')
      .exists()
      .containsText(t('viewMore'));

    await click('[data-test-storeknoxDiscover-results-viewMoreDisclaimerInfo]');

    assert
      .dom(
        '[data-test-storeknoxDiscover-results-disclaimerModalHeaderContainer]'
      )
      .exists()
      .containsText(t('storeknox.disclaimer'));

    assert
      .dom('[data-test-storeknoxDiscover-results-disclaimerModalWarningIcon]')
      .exists();

    assert
      .dom('[data-test-storeknoxDiscover-results-disclaimerModalCloseBtn]')
      .exists();

    assert
      .dom('[data-test-storeknoxDiscover-results-disclaimerModalCloseBtnIcon]')
      .exists();

    assert
      .dom('[data-test-storeknoxDiscover-results-disclaimerModalHeaderText]')
      .exists()
      .containsText(t('storeknox.disclaimerHeader'));

    compareInnerHTMLWithIntlTranslation(assert, {
      selector: '[data-test-storeknoxDiscover-results-disclaimerModalBodyText]',
      message: t('storeknox.disclaimerBody'),
    });

    // Close modal
    await click(
      '[data-test-storeknoxDiscover-results-disclaimerModalCloseBtn]'
    );

    assert
      .dom(
        '[data-test-storeknoxDiscover-results-disclaimerModalHeaderContainer]'
      )
      .doesNotExist();
  });

  test.each(
    'it searches for an application',
    [true, false],
    async function (assert, is_admin) {
      assert.expect(37);

      // role set to admin
      this.currentOrganizationMe.update({
        is_admin,
      });

      const searchText = 'example_app';

      this.server.post('v2/sk_discovery', (schema, req) => {
        const { query_str, ...rest } = JSON.parse(req.requestBody);

        assert.strictEqual(query_str, searchText);

        this.set('queryParams', { app_query: query_str });

        // Create results whose titles include search query
        Array.from({ length: 3 }, () =>
          this.server.create('sk-discovery-result', {
            title: `${searchText} ${faker.random.word()}`,
          })
        );

        // Create results whose titles do not include search query
        Array.from({ length: 2 }, () =>
          this.server.create('sk-discovery-result', {
            title: faker.random.word(),
          })
        );

        return {
          id: 1,
          ...rest,
          query: {
            q: query_str,
          },
        };
      });

      this.server.get('v2/sk_discovery/:id/search_results', (schema) => {
        const results = schema.skDiscoveryResults.where((result) =>
          result.title.includes(searchText)
        ).models;

        this.set('searchResults', results);

        return {
          count: results.length,
          next: null,
          previous: null,
          results,
        };
      });

      await visit('dashboard/storeknox/discover/result');

      assert
        .dom('[data-test-storeknoxDiscover-results-searchQueryInput]')
        .exists();

      assert
        .dom('[data-test-storeknoxDiscover-results-searchClearIcon]')
        .doesNotExist();

      assert.dom('[data-test-storeknoxDiscover-results-searchIcon]').exists();

      await fillIn(
        '[data-test-storeknoxDiscover-results-searchQueryInput]',
        searchText
      );

      assert
        .dom('[data-test-storeknoxDiscover-results-searchClearIcon]')
        .exists();

      assert
        .dom('[data-test-storeknoxDiscover-results-searchIcon]')
        .doesNotExist();

      await click('[data-test-storeknoxDiscover-results-searchTrigger]');

      assert
        .dom('[data-test-storeknoxDiscover-resultsTable-header]')
        .exists()
        .containsText(t('storeknox.showingResults'))
        .containsText(searchText);

      // Sanity check for results
      const appElementList = findAll(
        '[data-test-storeknoxDiscover-resultsTable-row]'
      );

      // this.searchResults was saved in mock service in this test block
      assert.strictEqual(appElementList.length, this.searchResults.length);

      for (let index = 0; index < this.searchResults.length; index++) {
        const sr = this.searchResults[index];

        const srElement = find(
          `[data-test-storeknoxDiscover-resultsTable-rowId='${sr.doc_ulid}']`
        );

        assert
          .dom(srElement)
          .exists()
          .containsText(sr.title)
          .containsText(sr.dev_email)
          .containsText(sr.dev_name);

        assert
          .dom('[data-test-applogo-img]', srElement)
          .exists()
          .hasAttribute('src', sr.icon_url);

        if (sr.platform === ENUMS.PLATFORM.ANDROID) {
          assert
            .dom(
              '[data-test-storeknoxTableColumns-store-playStoreIcon]',
              srElement
            )
            .exists();
        }

        if (sr.platform === ENUMS.PLATFORM.IOS) {
          assert
            .dom('[data-test-storeknoxTableColumns-store-iosIcon]', srElement)
            .exists();
        }

        const addOrSendAddAppReqButton =
          '[data-test-storeknoxDiscover-resultsTable-addOrSendAddAppReqButton]';

        await waitUntil(() => find(addOrSendAddAppReqButton), {
          timeout: 500,
        });

        assert.dom(addOrSendAddAppReqButton, srElement).exists();

        if (is_admin) {
          assert
            .dom(
              '[data-test-storeknoxDiscover-resultsTable-addIcon]',
              srElement
            )
            .exists();
        } else {
          assert
            .dom(
              '[data-test-storeknoxDiscover-resultsTable-SendAddAppReqIcon]',
              srElement
            )
            .exists();
        }
      }
    }
  );

  test.each(
    'it adds/requests add an app to the inventory',
    [{ is_admin: true }, { is_admin: false }],
    async function (assert, { is_admin }) {
      assert.expect(11);

      // role set to admin
      this.currentOrganizationMe.update({
        is_admin,
      });

      const searchText = 'example_app';

      this.server.post('v2/sk_discovery', (schema, req) => {
        const { query_str, ...rest } = JSON.parse(req.requestBody);
        const app_search_id = 1;

        this.set('queryParams', { app_query: query_str, app_search_id });

        // Check if query matches search text
        assert.strictEqual(query_str, searchText);

        // Create results whose titles which have search query
        Array.from({ length: 1 }, () =>
          this.server.create('sk-discovery-result', {
            title: `${searchText} ${faker.random.word()}`,
          })
        );

        return {
          id: app_search_id,
          ...rest,
          query: {
            q: query_str,
          },
        };
      });

      this.server.get('v2/sk_discovery/:id/search_results', (schema) => {
        const results = schema.skDiscoveryResults.where((result) => {
          return result.title.includes(searchText);
        }).models;

        this.set('searchResults', results);

        return {
          count: results.length,
          next: null,
          previous: null,
          results,
        };
      });

      this.server.post('v2/sk_app', (schema, req) => {
        const { doc_ulid, app_discovery_query } = JSON.parse(req.requestBody);

        const app_metadata = this.server.create('sk-app-metadata', {
          doc_ulid,
        });

        const skApp = this.server
          .create('sk-app', {
            app_metadata,
            approval_status: is_admin
              ? ENUMS.SK_APPROVAL_STATUS.APPROVED
              : ENUMS.SK_APPROVAL_STATUS.PENDING_APPROVAL,
            app_status: ENUMS.SK_APP_STATUS.ACTIVE,
          })
          .toJSON();

        return {
          ...skApp,
          app_discovery_query,
          app_metadata: app_metadata.toJSON(),
        };
      });

      await visit('dashboard/storeknox/discover/result');

      assert
        .dom('[data-test-storeknoxDiscover-results-searchQueryInput]')
        .exists();

      assert
        .dom('[data-test-storeknoxDiscover-results-searchClearIcon]')
        .doesNotExist();

      assert.dom('[data-test-storeknoxDiscover-results-searchIcon]').exists();

      await fillIn(
        '[data-test-storeknoxDiscover-results-searchQueryInput]',
        searchText
      );

      await click('[data-test-storeknoxDiscover-results-searchTrigger]');

      assert
        .dom('[data-test-storeknoxDiscover-resultsTable-header]')
        .exists()
        .containsText(t('storeknox.showingResults'))
        .containsText(searchText);

      // Add app to inventory
      const resultToAdd = this.searchResults[0];

      const srElement = find(
        `[data-test-storeknoxDiscover-resultsTable-rowId='${resultToAdd.doc_ulid}']`
      );

      const addToInventoryTriggerSelector =
        '[data-test-storeknoxDiscover-resultsTable-addOrSendAddAppReqButton]';

      await waitUntil(() => find(addToInventoryTriggerSelector), {
        timeout: 300,
      });

      assert.dom(addToInventoryTriggerSelector, srElement).exists();

      const triggerIconSelector = is_admin
        ? '[data-test-storeknoxDiscover-resultsTable-addIcon]'
        : '[data-test-storeknoxDiscover-resultsTable-SendAddAppReqIcon]';

      assert.dom(triggerIconSelector, srElement).exists();

      await click(addToInventoryTriggerSelector);

      const addOrRequestedIconSelector =
        '[data-test-storeknoxDiscover-resultsTable-addedOrRequestedIcon]';

      // Wait until loading state is finished
      await waitUntil(() => find(addOrRequestedIconSelector), {
        timeout: 300,
      });

      assert
        .dom(addOrRequestedIconSelector, srElement)
        .exists()
        .hasClass(is_admin ? /ak-icon-inventory-2/ : /ak-icon-schedule-send/);
    }
  );

  test('it renders the correct app request status', async function (assert) {
    assert.expect(15);

    const searchText = 'example_app';

    // Create results whose titles include search query
    const resultList = Array.from({ length: 3 }, () =>
      this.server.create('sk-discovery-result', {
        title: `${searchText} ${faker.random.word()}`,
      })
    );

    const resultIdWithPendindApproval = resultList[0].doc_ulid;
    const resultIdWithApproval = resultList[1].doc_ulid;

    this.server.post('v2/sk_discovery', (schema, req) => {
      const { query_str, ...rest } = JSON.parse(req.requestBody);
      const app_search_id = 1;

      this.set('queryParams', { app_query: query_str, app_search_id });

      // Check if search text and query values are the same
      assert.strictEqual(query_str, searchText);

      return {
        id: app_search_id,
        ...rest,
        query: {
          q: query_str,
        },
      };
    });

    this.server.get('v2/sk_discovery/:id/search_results', (schema) => {
      const results = schema.skDiscoveryResults.all().models;

      return {
        count: results.length,
        next: null,
        previous: null,
        results,
      };
    });

    this.server.get('v2/sk_app/check_approval_status', (schema, req) => {
      const { doc_ulid } = req.queryParams;

      const is_approved = resultIdWithApproval === doc_ulid;
      const is_pending_approval = resultIdWithPendindApproval === doc_ulid;

      if (!is_approved && !is_pending_approval) {
        return new Response(
          404,
          {},
          { detail: 'App not found in organization inventory.' }
        );
      }

      return {
        id: faker.number.int(),

        approval_status: is_approved
          ? ENUMS.SK_APPROVAL_STATUS.APPROVED
          : ENUMS.SK_APPROVAL_STATUS.PENDING_APPROVAL,

        approval_status_display: is_approved ? 'APPROVED' : 'PENDING_APPROVAL',
      };
    });

    await visit('dashboard/storeknox/discover/result');

    assert
      .dom('[data-test-storeknoxDiscover-results-searchQueryInput]')
      .exists();

    assert
      .dom('[data-test-storeknoxDiscover-results-searchClearIcon]')
      .doesNotExist();

    assert.dom('[data-test-storeknoxDiscover-results-searchIcon]').exists();

    await fillIn(
      '[data-test-storeknoxDiscover-results-searchQueryInput]',
      searchText
    );

    await click('[data-test-storeknoxDiscover-results-searchTrigger]');

    assert
      .dom('[data-test-storeknoxDiscover-resultsTable-header]')
      .exists()
      .containsText(t('storeknox.showingResults'))
      .containsText(searchText);

    for (let index = 0; index < resultList.length; index++) {
      const sr = resultList[index];
      const is_approved = resultIdWithApproval === sr.doc_ulid;
      const is_pending_approval = resultIdWithPendindApproval === sr.doc_ulid;

      const srElement = find(
        `[data-test-storeknoxDiscover-resultsTable-rowId='${sr.doc_ulid}']`
      );

      if (!is_pending_approval && !is_approved) {
        const addToInventoryTriggerSelector =
          '[data-test-storeknoxDiscover-resultsTable-addOrSendAddAppReqButton]';

        await waitUntil(() => find(addToInventoryTriggerSelector), {
          timeout: 300,
        });

        assert.dom(addToInventoryTriggerSelector, srElement).exists();

        assert
          .dom(
            this.currentOrganizationMe.is_admin
              ? '[data-test-storeknoxDiscover-resultsTable-addIcon]'
              : '[data-test-storeknoxDiscover-resultsTable-SendAddAppReqIcon]',
            srElement
          )
          .exists();

        // Check for tooltip message
        const tooltipSelector =
          '[data-test-storeknoxDiscover-resultsTable-addedOrRequestedTooltip]';

        const tooltipContentSelector = '[data-test-ak-tooltip-content]';
        const actionTriggerBtnTooltip = find(tooltipSelector);

        await triggerEvent(actionTriggerBtnTooltip, 'mouseenter');

        assert
          .dom(tooltipContentSelector)
          .exists()
          .hasText(
            t(
              is_approved
                ? 'storeknox.appAlreadyExists'
                : 'storeknox.appAlreadyRequested'
            )
          );

        await triggerEvent(actionTriggerBtnTooltip, 'mouseleave');
      } else {
        const addOrRequestedIconSelector =
          '[data-test-storeknoxDiscover-resultsTable-addedOrRequestedIcon]';

        // Wait until check approval is completed
        await waitUntil(() => find(addOrRequestedIconSelector), {
          timeout: 300,
        });

        assert
          .dom(addOrRequestedIconSelector, srElement)
          .exists()
          .hasClass(
            is_approved ? /ak-icon-inventory-2/ : /ak-icon-schedule-send/
          );
      }
    }
  });

  test.each(
    'it throws error if app is already added to inventory or pending approval',
    [
      'An app with this ULID is already in the inventory in APPROVED status',
      'An app with this ULID is already in the inventory in PENDING_APPROVAL status',
    ],
    async function (assert, error) {
      const searchText = 'example_app';

      // server mocks
      this.server.post('/v2/sk_discovery', (schema, req) => {
        const { query_str, ...rest } = JSON.parse(req.requestBody);
        const app_search_id = 1;

        this.set('queryParams', { app_query: query_str, app_search_id });

        // Check if query matches search text
        assert.strictEqual(query_str, searchText);

        // Create results whose titles which have search query
        Array.from({ length: 1 }, () =>
          this.server.create('sk-discovery-result', {
            title: `${searchText} ${faker.random.word()}`,
          })
        );

        return {
          id: app_search_id,
          ...rest,
          query: {
            q: query_str,
          },
        };
      });

      this.server.get('v2/sk_discovery/:id/search_results', (schema) => {
        const results = schema.skDiscoveryResults.where((result) => {
          return result.title.includes(searchText);
        }).models;

        this.set('searchResults', results);

        return {
          count: results.length,
          next: null,
          previous: null,
          results,
        };
      });

      this.server.post('v2/sk_app', () => {
        return new Response(
          400,
          {},
          {
            doc_ulid: [error],
          }
        );
      });

      // Test Start
      await visit('dashboard/storeknox/discover/result');

      assert
        .dom('[data-test-storeknoxDiscover-results-searchQueryInput]')
        .exists();

      assert
        .dom('[data-test-storeknoxDiscover-results-searchClearIcon]')
        .doesNotExist();

      assert.dom('[data-test-storeknoxDiscover-results-searchIcon]').exists();

      await fillIn(
        '[data-test-storeknoxDiscover-results-searchQueryInput]',
        searchText
      );

      await click('[data-test-storeknoxDiscover-results-searchTrigger]');

      assert
        .dom('[data-test-storeknoxDiscover-resultsTable-header]')
        .exists()
        .containsText(t('storeknox.showingResults'))
        .containsText(searchText);

      // Add app to inventory
      const resultToAdd = this.searchResults[0];

      const srElement = find(
        `[data-test-storeknoxDiscover-resultsTable-rowId='${resultToAdd.doc_ulid}']`
      );

      const addToInventoryTriggerSelector =
        '[data-test-storeknoxDiscover-resultsTable-addOrSendAddAppReqButton]';

      await waitUntil(() => find(addToInventoryTriggerSelector), {
        timeout: 300,
      });

      assert.dom(addToInventoryTriggerSelector, srElement).exists();

      const triggerIconSelector = this.currentOrganizationMe.is_admin
        ? '[data-test-storeknoxDiscover-resultsTable-addIcon]'
        : '[data-test-storeknoxDiscover-resultsTable-SendAddAppReqIcon]';

      assert.dom(triggerIconSelector, srElement).exists();

      await click(addToInventoryTriggerSelector);

      // Wait until loading state is finished
      await waitUntil(() => find(addToInventoryTriggerSelector), {
        timeout: 5000,
      });

      assert.dom(addToInventoryTriggerSelector, srElement).exists();
      assert.dom(triggerIconSelector, srElement).exists();

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, error);
    }
  );
});
