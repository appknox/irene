import {
  click,
  currentURL,
  find,
  fillIn,
  findAll,
  triggerEvent,
  triggerKeyEvent,
  visit,
} from '@ember/test-helpers';

import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { Response } from 'miragejs';
import { t } from 'ember-intl/test-support';
import { faker } from '@faker-js/faker';
import { clickTrigger } from 'ember-power-select/test-support/helpers';

import ENUMS from 'irene/enums';
import { assertAkSelectTriggerExists } from 'irene/tests/helpers/mirage-utils';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

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

// Mirrors APIScanStatusEnum in mycroft
const API_SCAN_URL_STATUS = ENUMS.API_SCAN_URL_STATUS;

const API_SCAN_URLS = [
  {
    id: 1,
    request: {
      method: 'GET',
      scheme: 'https',
      host: 'api.example.com',
      port: '443',
      path: '/api/v1/auth/session',
    },
    status: API_SCAN_URL_STATUS.COMPLETED,
    scanned_on: '2026-10-28T10:42:08Z',
  },
  {
    id: 2,
    request: {
      method: 'POST',
      scheme: 'https',
      host: 'api.example.com',
      port: '443',
      path: '/api/v1/auth/login',
    },
    status: API_SCAN_URL_STATUS.COMPLETED,
    scanned_on: '2026-10-28T10:42:31Z',
  },
  {
    id: 3,
    request: {
      method: 'POST',
      scheme: 'https',
      host: 'api.example.com',
      port: '443',
      path: '/api/v1/transfers',
    },
    status: API_SCAN_URL_STATUS.IN_PROGRESS,
    scanned_on: null,
  },
  {
    id: 4,
    request: {
      method: 'DELETE',
      scheme: 'https',
      host: 'api.example.com',
      port: '443',
      path: '/api/v1/payees/{id}',
    },
    status: API_SCAN_URL_STATUS.PENDING,
    scanned_on: null,
  },
  {
    id: 5,
    request: {
      method: 'GET',
      scheme: 'https',
      host: 'api.example.com',
      port: '443',
      path: '/api/v1/notifications',
    },
    status: API_SCAN_URL_STATUS.FAILED,
    scanned_on: null,
  },
];

const API_SCAN_URL_STATUS_LABEL = {
  [API_SCAN_URL_STATUS.PENDING]: () => t('apiScanModule.queued'),
  [API_SCAN_URL_STATUS.IN_PROGRESS]: () => t('scanning'),
  [API_SCAN_URL_STATUS.COMPLETED]: () => t('apiScanModule.scanned'),
  [API_SCAN_URL_STATUS.FAILED]: () => t('failed'),
};

// The same scan after a stop, which cancelled the endpoint it never reached
const STOPPED_API_SCAN_URLS = API_SCAN_URLS.map((url) =>
  url.status === API_SCAN_URL_STATUS.PENDING
    ? { ...url, status: API_SCAN_URL_STATUS.CANCELLED }
    : url
);

function setupApiScanUrlsEndpoint(
  server,
  onRequest = () => {},
  scanUrls = API_SCAN_URLS
) {
  server.get('/v2/files/:id/api_scan_urls', (_, req) => {
    onRequest(req);

    const q = (req.queryParams.q || '').toLowerCase();
    const results = scanUrls.filter(
      (u) =>
        u.request.host.toLowerCase().includes(q) ||
        u.request.path.toLowerCase().includes(q)
    );

    return {
      count: results.length,
      next: null,
      previous: null,
      results,
      total_count: scanUrls.length,
      scanned_count: scanUrls.filter(
        (u) => u.status === API_SCAN_URL_STATUS.COMPLETED
      ).length,
      cancelled_count: scanUrls.filter(
        (u) => u.status === API_SCAN_URL_STATUS.CANCELLED
      ).length,
    };
  });
}

module('Acceptance | file-details/api-scan', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { vulnerabilities } = await setupRequiredEndpoints(this.server);
    setupFileModelEndpoints(this.server);

    const store = this.owner.lookup('service:store');
    const profile = this.server.create('profile', { id: '1' });

    const project = this.server.create('project', {
      active_profile_id: profile.id,
    });

    const file = this.server.create('file', {
      is_static_done: true,
      is_dynamic_done: true,
      is_api_done: false,
      is_active: true,
      project: project.id,
      profile: profile.id,
    });

    // Create analyses
    const analyses = vulnerabilities.map((v, id) =>
      store.push(
        store.normalize(
          'analysis',
          this.server
            .create('analysis', {
              id,
              vulnerability: v.id,
              file: file.id,
            })
            .toJSON()
        )
      )
    );

    const capturedApis = [
      ...this.server.createList('capturedapi', 3, { is_active: false }),
      ...this.server.createList('capturedapi', 7, { is_active: true }),
    ];

    this.server.create('project', {
      file: file.id,
      id: '1',
      platform: ENUMS.PLATFORM.ANDROID,
    });

    // service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    // server api interception
    this.server.get('/v3/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v3/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.setProperties({
      project,
      file,
      capturedApis,
      analyses,
      store,
    });
  });

  test('it renders api scan with captured api count 0', async function (assert) {
    this.server.get('/v2/files/1/capturedapis', () => {
      return { next: null, previous: null, count: 0, results: [] };
    });

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    assert.dom('[data-test-fileDetails-apiScan-breadcrumbContainer]').exists();

    const breadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    breadcrumbsService.breadcrumbItems.map((item) => {
      assert
        .dom(`[data-test-ak-breadcrumbs-auto-trail-item-key="${item.route}"]`)
        .exists()
        .containsText(item.title);
    });

    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    assert
      .dom('[data-test-fileDetails-apiScan-tabs="api-scan-tab"]')
      .hasText(t('apiScan'));

    assert
      .dom('[data-test-fileDetails-apiScan-capturedApis-emptySvg]')
      .exists();

    assert
      .dom('[data-test-fileDetails-apiScan-capturedApis-emptyTitle]')
      .hasText(t('capturedApiEmptyTitle'));

    assert
      .dom('[data-test-fileDetails-apiScan-capturedApis-stepsToCaptureChip]')
      .hasText(t('capturedApiEmptyStepsLabel'));

    const apiCaptureSteps = [
      t('capturedApiEmptySteps.0'),
      t('capturedApiEmptySteps.1'),
      t('capturedApiEmptySteps.2'),
    ];

    apiCaptureSteps.forEach((step) => {
      assert
        .dom(
          `[data-test-fileDetails-apiScan-capturedApis-stepsToCaptureBullet="${step}"]`
        )
        .exists();

      assert
        .dom(
          `[data-test-fileDetails-apiScan-capturedApis-stepsToCaptureValue="${step}"]`
        )
        .hasText(step);
    });

    assert
      .dom('[data-test-fileDetails-apiScan-footerContainer]')
      .doesNotExist();
  });

  test('it renders api scan with captured api count greater than 0', async function (assert) {
    this.server.get('/v2/files/:id/capturedapis', (schema, req) => {
      const results = req.queryParams.is_active
        ? schema.db.capturedapis.where({ is_active: true })
        : schema.capturedapis.all().models;

      return { count: results.length, previous: null, next: null, results };
    });

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    assert.dom('[data-test-fileDetails-apiScan-breadcrumbContainer]').exists();
    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    assert
      .dom('[data-test-fileDetails-apiScan-tabs="api-scan-tab"]')
      .hasText(t('apiScan'));

    assert
      .dom('[data-test-fileDetails-apiScan-capturedApi-title]')
      .hasText(t('capturedApiListTitle'));

    const apiEndpoints = findAll(
      '[data-test-fileDetails-apiScan-capturedApi-endpointContainer]'
    );

    assert.strictEqual(apiEndpoints.length, 10);

    // first 3 api not selected
    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]',
        apiEndpoints[0]
      )
      .isNotDisabled()
      .isNotChecked();

    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApi-endpointMethodChip]',
        apiEndpoints[0]
      )
      .hasText(this.capturedApis[0].request.method);

    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApi-endpointMethodChip]',
        apiEndpoints[0]
      )
      .hasText(this.capturedApis[0].request.method);

    const { scheme, path, host, port } = this.capturedApis[0].request;

    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApi-endpointUrl]',
        apiEndpoints[0]
      )
      .hasText(`${scheme}://${host}:${port}${path}`);

    assert.dom('[data-test-fileDetails-apiScan-footerContainer]').exists();

    const selected = this.capturedApis.filter((it) => it.is_active);

    assert
      .dom('[data-test-fileDetails-apiScan-footerTitle]')
      .hasText(t('startScan'));

    assert.dom('[data-test-fileDetails-apiScan-footerDesc]').hasText(
      t('capturedApiSelectedTotalCount', {
        selectedCount: selected.length,
        totalCount: this.capturedApis.length,
      })
    );

    assert
      .dom('[data-test-fileDetails-apiScan-actionBtn]')
      .isNotDisabled()
      .hasText(t('apiScan'));
  });

  test.each(
    'it selects and unselects all captured APIs',
    [true, false],
    async function (assert, is_active) {
      // Return opposite toggle states for all API endpoints
      this.server.db.capturedapis.update({ is_active });

      this.server.get('/v2/files/:id/capturedapis', (schema) => {
        const results = schema.capturedapis.all().models;

        return { count: results.length, previous: null, next: null, results };
      });

      this.server.put('/v2/files/:id/toggle_captured_apis', (schema, req) => {
        const { is_active } = JSON.parse(req.requestBody);

        const results = schema.capturedapis.all().models;

        results.forEach((api) => api.update({ is_active }));

        return { count: results.length, previous: null, next: null, results };
      });

      this.server.get('/v2/files/:id/toggle_captured_apis', () => {
        return { is_active };
      });

      await visit(`/dashboard/file/${this.file.id}/api-scan`);

      assert
        .dom('[data-test-fileDetails-apiScan-breadcrumbContainer]')
        .exists();

      assert.dom('[data-test-fileDetailsSummary-root]').exists();

      assert
        .dom('[data-test-fileDetails-apiScan-tabs="api-scan-tab"]')
        .hasText(t('apiScan'));

      assert
        .dom('[data-test-fileDetails-apiScan-capturedApi-title]')
        .hasText(t('capturedApiListTitle'));

      assert
        .dom('[data-test-fileDetails-apiScan-selectAllCapturedApis-text]')
        .hasText(t('selectAll'));

      let apiEndpoints = findAll(
        '[data-test-fileDetails-apiScan-capturedApi-endpointContainer]'
      );

      assert.strictEqual(apiEndpoints.length, 10);

      // All APIs should reflect the correct states
      apiEndpoints.forEach((endpoint) => {
        const endpointSelector =
          '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]';

        if (is_active) {
          assert.dom(endpointSelector, endpoint).isNotDisabled().isChecked();
        } else {
          assert.dom(endpointSelector, endpoint).isNotDisabled().isNotChecked();
        }
      });

      await click(
        '[data-test-fileDetails-apiScan-selectAllCapturedApis-checkbox]'
      );

      apiEndpoints = findAll(
        '[data-test-fileDetails-apiScan-capturedApi-endpointContainer]'
      );

      // All APIs should reflect the correct states
      apiEndpoints.forEach((endpoint) => {
        const endpointSelector =
          '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]';

        if (is_active) {
          assert.dom(endpointSelector, endpoint).isNotDisabled().isNotChecked();
        } else {
          assert.dom(endpointSelector, endpoint).isNotDisabled().isChecked();
        }
      });
    }
  );

  // Check domain filter selected item
  const checkDomainFilterSelectedItem = (assert, selectedItemCount = 0) => {
    if (selectedItemCount === 0) {
      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-emptyIcon]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-label]'
        )
        .hasText(t('apiScanModule.domainFilters'));
    } else {
      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-emptyIcon]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-icon]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-count]'
        )
        .hasText(String(selectedItemCount));

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-label]'
        )
        .hasText(t('apiScanModule.optionsSelected'));

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-clearAllBtn]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-clearAllBtn-icon]'
        )
        .exists();
    }
  };

  // Select api domain filters
  const selectApiDomainFilters = async (assert, options) => {
    for (const option of options) {
      const checkboxSelector = `[data-test-fileDetails-apiScan-capturedApi-domainFilterGroupOption-checkbox="${option}"]`;

      await click(checkboxSelector);
      assert.dom(checkboxSelector).isChecked();
    }
  };

  // Confirm api endpoints are rendered
  const confirmApiEndpointsAreRendered = (
    assert,
    expectedCount,
    capturedApis = [],
    selectedAll = false
  ) => {
    const apiEndpoints = findAll(
      '[data-test-fileDetails-apiScan-capturedApi-endpointContainer]'
    );

    assert.strictEqual(apiEndpoints.length, expectedCount);

    // Sanity check for captured api endpoints
    capturedApis.forEach((capturedApi) => {
      const capturedApiElement = find(
        `[data-test-fileDetails-apiScan-capturedApi-endpointContainer-item="${capturedApi.id}"]`
      );

      assert
        .dom(capturedApiElement)
        .containsText(capturedApi.request.method)
        .containsText(capturedApi.request.host);

      // Checked state should retain overall select all state
      const capturedApiSelectCheckbox =
        '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]';

      if (selectedAll) {
        assert.dom(capturedApiSelectCheckbox, capturedApiElement).isChecked();
      } else {
        assert
          .dom(capturedApiSelectCheckbox, capturedApiElement)
          .isNotChecked();
      }
    });
  };

  test.each(
    'it applies api domain filters to captured api list',
    [true, false],
    async function (assert, selectAllByDefault) {
      assert.expect(107);

      // Return unchecked toggle states for all API endpoints
      this.server.db.capturedapis.update({ is_active: selectAllByDefault });

      // Test Constants
      const autoGeneratedApiFilters = this.server.db.capturedapis.map(
        (capi) => capi.request.host
      );

      const testPrjLevelDomains = ['test.example.com', 'another.example.org'];

      // Server Mocks
      this.server.get('/v2/files/:id/capturedapis_domains', () => {
        return {
          project_profile_api_filters: testPrjLevelDomains,
          auto_generated_api_filters: autoGeneratedApiFilters,
        };
      });

      this.server.get('/v2/files/:id/toggle_captured_apis', () => {
        return { is_active: selectAllByDefault };
      });

      this.server.put('/v2/files/:id/toggle_captured_apis', (schema, req) => {
        const { is_active } = JSON.parse(req.requestBody);
        const results = schema.capturedapis.all().models;

        results.forEach((api) => api.update({ is_active }));

        return { count: results.length, previous: null, next: null, results };
      });

      this.server.get('/v2/files/:id/capturedapis', (schema, req) => {
        const domains = req.queryParams.domains.split(',').filter(Boolean);
        const hasDomains = domains.length > 0;
        const is_active = req.queryParams.is_active;

        let results = schema.capturedapis
          .all()
          .models.filter((api) =>
            hasDomains ? domains.includes(api.request.host) : true
          );

        // Return only active api endpoints
        if (is_active) {
          results = results.filter((api) => api.is_active);
        }

        return { count: results.length, previous: null, next: null, results };
      });

      // Test Start
      await visit(`/dashboard/file/${this.file.id}/api-scan`);

      // Selector Attributes
      const clearAllBtn =
        '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-clearAllBtn]';

      const unselectAllBtn =
        '[data-test-fileDetails-apiScan-capturedApi-domainFilterUnselectAll-unselectAllBtn]';

      const applyFiltersBtn =
        '[data-test-fileDetails-apiScan-capturedApi-domainFilterApplyFilters-applyBtn]';

      const domainFilterSelectTrigger =
        '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelect]';

      // Confirm api endpoints are rendered
      confirmApiEndpointsAreRendered(
        assert,
        this.capturedApis.length,
        this.capturedApis,
        selectAllByDefault
      );

      assert.dom('[data-test-fileDetails-apiScan-footerContainer]').exists();

      assert.dom('[data-test-fileDetails-apiScan-footerDesc]').hasText(
        t('capturedApiSelectedTotalCount', {
          selectedCount: selectAllByDefault ? this.capturedApis.length : 0,
          totalCount: this.capturedApis.length,
        })
      );

      // Ensure domain filter select trigger exists
      assertAkSelectTriggerExists(assert, domainFilterSelectTrigger);
      await clickTrigger(domainFilterSelectTrigger);

      // Check that the domain filter selected item is empty
      checkDomainFilterSelectedItem(assert, 0);

      // Popover should contain project and auto generated api domain filters
      const expectedDomainFilterGroups = [
        {
          id: 'project-profile-filters',
          groupName: t('apiScanModule.projectProfileFilters'),
          options: testPrjLevelDomains,
        },
        {
          id: 'auto-generated-filters',
          groupName: t('apiScanModule.autoGeneratedFilters'),
          options: autoGeneratedApiFilters,
        },
      ];

      expectedDomainFilterGroups.forEach((group) => {
        assert
          .dom(
            `[data-test-fileDetails-apiScan-capturedApi-domainFilterGroup="${group.groupName}"]`
          )
          .exists();

        // Project List external settings icon should exist
        if (group.id === 'project-profile-filters') {
          assert
            .dom(
              '[data-test-fileDetails-apiScan-capturedApi-domainFilterGroupOption-openPrjSettingsLink]'
            )
            .hasAttribute(
              'href',
              `/dashboard/project/${this.project.id}/settings`
            );

          assert
            .dom(
              '[data-test-fileDetails-apiScan-capturedApi-domainFilterGroupOption-openPrjSettingsLink-icon]'
            )
            .exists();
        }

        // Check that all options are not checked
        group.options.forEach((option) => {
          assert
            .dom(
              `[data-test-fileDetails-apiScan-capturedApi-domainFilterGroupOption-checkbox="${option}"]`
            )
            .isNotChecked();

          assert
            .dom(
              `[data-test-fileDetails-apiScan-capturedApi-domainFilterGroupOption-label="${option}"]`
            )
            .hasText(option);
        });
      });

      // Apply first group option from  project profile filters
      const projectProfileFilterOption =
        expectedDomainFilterGroups[0].options[0];

      await selectApiDomainFilters(assert, [projectProfileFilterOption]);

      assert
        .dom(
          `[data-test-fileDetails-apiScan-capturedApi-domainFilterGroupOption-checkbox="${projectProfileFilterOption}"]`
        )
        .isChecked();

      assert.dom(unselectAllBtn).exists();
      assert.dom(applyFiltersBtn).isNotDisabled();

      await click(applyFiltersBtn);

      // Expected selected domain count should be 1
      checkDomainFilterSelectedItem(assert, 1);

      // Expected result should be empty
      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApisDomainFilter-emptySvg]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApisDomainFilter-emptyTitle]'
        )
        .hasText(t('apiScanModule.noApiFound'));

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApisDomainFilter-emptyDescription]'
        )
        .hasText(t('apiScanModule.noApiFoundDesc'));

      assert
        .dom('[data-test-fileDetails-apiScan-footerContainer]')
        .doesNotExist();

      // Clear filter selection of domain filters
      await click(clearAllBtn);

      assert.dom('[data-test-fileDetails-apiScan-footerContainer]').exists();

      assert.dom('[data-test-fileDetails-apiScan-footerDesc]').hasText(
        t('capturedApiSelectedTotalCount', {
          selectedCount: selectAllByDefault ? this.capturedApis.length : 0,
          totalCount: this.capturedApis.length,
        })
      );

      assert
        .dom(
          '[data-test-fileDetails-apiScan-capturedApi-domainFilterSelectedItem-emptyIcon]'
        )
        .exists();

      // Open domain filter select
      await clickTrigger(domainFilterSelectTrigger);

      // Apply first two options from auto generated filters
      const autoGeneratedFilterOptions =
        expectedDomainFilterGroups[1].options.slice(0, 2);

      await selectApiDomainFilters(assert, autoGeneratedFilterOptions);

      assert.dom(unselectAllBtn).exists();
      assert.dom(applyFiltersBtn).isNotDisabled();

      await click(applyFiltersBtn);

      // Expected selected domain count should be 2
      checkDomainFilterSelectedItem(assert, 2);

      // Expected result should be two api endpoints
      const filteredApis = this.capturedApis.filter((it) =>
        autoGeneratedFilterOptions.includes(it.request.host)
      );

      confirmApiEndpointsAreRendered(
        assert,
        filteredApis.length,
        filteredApis,
        selectAllByDefault
      );

      assert.dom('[data-test-fileDetails-apiScan-footerContainer]').exists();

      assert.dom('[data-test-fileDetails-apiScan-footerDesc]').hasText(
        t('capturedApiSelectedTotalCount', {
          selectedCount: selectAllByDefault ? filteredApis.length : 0,
          totalCount: filteredApis.length,
        })
      );

      // Unselect all domain filters
      // Should revert list to all api endpoints
      await clickTrigger(domainFilterSelectTrigger);
      await click(unselectAllBtn);

      // Expected selected domain count should be 0
      checkDomainFilterSelectedItem(assert, 0);

      // Expected result should be complete api endpoints
      confirmApiEndpointsAreRendered(assert, this.capturedApis.length);

      assert.dom('[data-test-fileDetails-apiScan-footerContainer]').exists();

      assert.dom('[data-test-fileDetails-apiScan-footerDesc]').hasText(
        t('capturedApiSelectedTotalCount', {
          selectedCount: selectAllByDefault ? this.capturedApis.length : 0,
          totalCount: this.capturedApis.length,
        })
      );
    }
  );

  test('it searches captured apis by host or path', async function (assert) {
    let lastQuery = null;

    const matches = (capi, q) =>
      capi.request.host.toLowerCase().includes(q) ||
      capi.request.path.toLowerCase().includes(q);

    this.server.get('/v2/files/:id/capturedapis', (schema, req) => {
      const q = (req.queryParams.q || '').toLowerCase();

      if (!req.queryParams.is_active) {
        lastQuery = req.queryParams.q;
      }

      const results = schema.capturedapis
        .all()
        .models.filter(
          (capi) =>
            matches(capi, q) && (!req.queryParams.is_active || capi.is_active)
        );

      return { count: results.length, previous: null, next: null, results };
    });

    this.server.get('/v2/files/:id/capturedapis_domains', () => ({
      project_profile_api_filters: [],
      auto_generated_api_filters: [],
    }));

    this.server.get('/v2/files/:id/toggle_captured_apis', () => ({
      is_active: false,
    }));

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    const endpoints =
      '[data-test-fileDetails-apiScan-capturedApi-endpointContainer]';
    const searchInput =
      '[data-test-fileDetails-apiScan-capturedApi-searchInput]';

    assert.dom(searchInput).exists();
    assert.strictEqual(findAll(endpoints).length, 10);

    const term = this.capturedApis[4].request.path.toLowerCase();
    const expected = this.capturedApis.filter((capi) => matches(capi, term));

    await fillIn(searchInput, term);
    await triggerKeyEvent(searchInput, 'keyup', 'A');

    assert.strictEqual(lastQuery, term);
    assert.strictEqual(findAll(endpoints).length, expected.length);

    // The header, and so the search box, stays visible when nothing matches
    await fillIn(searchInput, 'no-such-endpoint-anywhere');
    await triggerKeyEvent(searchInput, 'keyup', 'A');

    assert.strictEqual(findAll(endpoints).length, 0);
    assert.dom(searchInput).exists();

    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApisDomainFilter-emptyTitle]'
      )
      .hasText(t('apiScanModule.noApiFound'));

    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApisDomainFilter-emptyDescription]'
      )
      .hasText(t('apiScanModule.noApiFoundDesc'));
  });

  test('test toggle api endpoint selection', async function (assert) {
    this.server.get('/v2/files/:id/capturedapis', (schema, req) => {
      const results = req.queryParams.is_active
        ? schema.db.capturedapis.where({ is_active: true })
        : schema.capturedapis.all().models;

      return { count: results.length, previous: null, next: null, results };
    });

    this.server.put('/capturedapis/:id', (schema, req) => {
      const data = JSON.parse(req.requestBody);

      schema.db.capturedapis.update(`${req.params.id}`, {
        is_active: data.is_active,
      });

      return schema.capturedapis.find(`${req.params.id}`)?.toJSON();
    });

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    assert.dom('[data-test-fileDetails-apiScan-breadcrumbContainer]').exists();
    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    assert
      .dom('[data-test-fileDetails-apiScan-tabs="api-scan-tab"]')
      .hasText(t('apiScan'));

    assert
      .dom('[data-test-fileDetails-apiScan-capturedApi-title]')
      .hasText(t('capturedApiListTitle'));

    const selected = this.capturedApis.filter((it) => it.is_active);

    assert.dom('[data-test-fileDetails-apiScan-footerContainer]').exists();

    assert.dom('[data-test-fileDetails-apiScan-footerDesc]').hasText(
      t('capturedApiSelectedTotalCount', {
        selectedCount: selected.length,
        totalCount: this.capturedApis.length,
      })
    );

    const apiEndpoints = findAll(
      '[data-test-fileDetails-apiScan-capturedApi-endpointContainer]'
    );

    assert.strictEqual(apiEndpoints.length, 10);

    // first 3 api not selected
    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]',
        apiEndpoints[0]
      )
      .isNotDisabled()
      .isNotChecked();

    await click(
      apiEndpoints[0].querySelector(
        '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]'
      )
    );

    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]',
        apiEndpoints[0]
      )
      .isNotDisabled()
      .isChecked();

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.successMsg, t('capturedApiSaveSuccessMsg'));

    // should be +1
    assert.dom('[data-test-fileDetails-apiScan-footerDesc]').hasText(
      t('capturedApiSelectedTotalCount', {
        selectedCount: selected.length + 1,
        totalCount: this.capturedApis.length,
      })
    );

    await click(
      apiEndpoints[0].querySelector(
        '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]'
      )
    );

    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]',
        apiEndpoints[0]
      )
      .isNotDisabled()
      .isNotChecked();

    // should be back to initial state
    assert.dom('[data-test-fileDetails-apiScan-footerDesc]').hasText(
      t('capturedApiSelectedTotalCount', {
        selectedCount: selected.length,
        totalCount: this.capturedApis.length,
      })
    );
  });

  test.each(
    'test run api scan',
    [
      { withApiProxySetting: true },
      { withApiProxySetting: false },
      { fail: true },
    ],
    async function (assert, { withApiProxySetting, fail }) {
      this.server.get('/v2/files/:id/capturedapis', (schema, req) => {
        const results = req.queryParams.is_active
          ? schema.db.capturedapis.where({ is_active: true })
          : schema.capturedapis.all().models;

        return { count: results.length, previous: null, next: null, results };
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: withApiProxySetting ? faker.internet.ip() : '',
          port: withApiProxySetting ? faker.internet.port() : '',
          enabled: false,
        };
      });

      this.server.post('/v2/files/:id/start_apiscan_v2', () =>
        fail
          ? new Response(501, {}, { detail: 'API run failed to start' })
          : new Response(201)
      );

      await visit(`/dashboard/file/${this.file.id}/api-scan`);

      assert
        .dom('[data-test-fileDetails-apiScan-breadcrumbContainer]')
        .exists();

      assert.dom('[data-test-fileDetailsSummary-root]').exists();

      assert
        .dom('[data-test-fileDetails-apiScan-tabs="api-scan-tab"]')
        .hasText(t('apiScan'));

      assert
        .dom('[data-test-fileDetails-apiScan-capturedApi-title]')
        .hasText(t('capturedApiListTitle'));

      assert.dom('[data-test-fileDetails-apiScan-footerContainer]').exists();

      assert
        .dom('[data-test-fileDetails-apiScan-actionBtn]')
        .isNotDisabled()
        .hasText(t('apiScan'));

      assert.dom('[data-test-fileDetails-apiScanDrawer]').doesNotExist();

      await click('[data-test-fileDetails-apiScan-actionBtn]');

      assert
        .dom('[data-test-fileDetails-apiScanDrawer-title]')
        .hasText(t('apiScan'));

      assert
        .dom('[data-test-fileDetails-apiScanDrawer-closeBtn]')
        .isNotDisabled();

      assert.strictEqual(
        find(
          '[data-test-fileDetails-apiScanDrawer-warnAlert]'
        ).innerHTML.trim(),
        t('modalCard.apiScan.warning')
      );

      assert
        .dom('[data-test-fileDetails-apiScanDrawer-apiSelectedTitle]')
        .hasText(t('capturedApiSelectedTitle'));

      assert
        .dom('[data-test-fileDetails-apiScanDrawer-apiSelectedDesc]')
        .hasText(t('capturedApiSelectedDesc'));

      const selected = this.capturedApis.filter((it) => it.is_active);

      assert
        .dom('[data-test-fileDetails-apiScanDrawer-apiSelectedCount]')
        .hasText(
          t('capturedApiSelectedTotalCountToPerfApiScan', {
            selectedCount: selected.length,
            totalCount: this.capturedApis.length,
          })
        );

      const proxySetting = this.store.peekRecord(
        'proxy-setting',
        this.file.profile
      );

      if (proxySetting.hasProxyUrl) {
        assert.dom('[data-test-fileDetails-proxySettings-container]').exists();

        assert
          .dom(
            '[data-test-fileDetails-proxySettings-enableApiProxyToggle] [data-test-toggle-input]'
          )
          .isNotDisabled()
          .isNotChecked();

        assert
          .dom('[data-test-fileDetails-proxySettings-enableApiProxyLabel]')
          .hasText(`${t('enable')} ${t('proxySettingsTitle')}`);

        assert
          .dom('[data-test-fileDetails-proxySettings-editSettings]')
          .hasTagName('a')
          .hasAttribute('href', '/dashboard/project/1/settings')
          .hasText(t('edit'));

        assert.dom('[data-test-fileDetails-proxySettings-helpIcon]').exists();

        await triggerEvent(
          '[data-test-fileDetails-proxySettings-helpIcon]',
          'mouseenter'
        );

        assert
          .dom('[data-test-fileDetails-proxySettings-helpTooltipContent]')
          .hasText(
            `${t('proxySettingsRouteVia')} ${proxySetting.host}:${proxySetting.port}`
          );

        await triggerEvent(
          '[data-test-fileDetails-proxySettings-helpIcon]',
          'mouseleave'
        );
      } else {
        assert
          .dom('[data-test-fileDetails-proxySettings-container]')
          .doesNotExist();
      }

      assert
        .dom('[data-test-fileDetails-apiScanDrawer-startBtn]')
        .isNotDisabled()
        .hasText(t('start'));

      assert
        .dom('[data-test-fileDetails-apiScanDrawer-cancelBtn]')
        .isNotDisabled()
        .hasText(t('cancel'));

      await click('[data-test-fileDetails-apiScanDrawer-startBtn]');

      if (fail) {
        const notify = this.owner.lookup('service:notifications');

        assert.strictEqual(notify.errorMsg, 'API run failed to start');

        assert
          .dom('[data-test-fileDetails-apiScanDrawer-startBtn]')
          .isNotDisabled();

        assert
          .dom('[data-test-fileDetails-apiScanDrawer-startBtn]')
          .isNotDisabled();
      } else {
        assert.dom('[data-test-fileDetails-apiScanDrawer]').doesNotExist();
      }
    }
  );

  test.each(
    'test api scan run status',
    [ENUMS.SCAN_STATUS.RUNNING, ENUMS.SCAN_STATUS.COMPLETED],
    async function (assert, status) {
      this.file.update({
        api_scan_status: status,
        is_api_done: status === ENUMS.SCAN_STATUS.COMPLETED,
      });

      setupApiScanUrlsEndpoint(this.server);

      await visit(`/dashboard/file/${this.file.id}/api-scan`);

      assert
        .dom('[data-test-fileDetails-apiScan-breadcrumbContainer]')
        .exists();

      assert.dom('[data-test-fileDetailsSummary-root]').exists();

      assert
        .dom('[data-test-fileDetails-apiScan-tabs="api-scan-tab"]')
        .hasText(t('apiScan'));

      assert
        .dom('[data-test-fileDetails-apiScan-progressStatus-container]')
        .exists();

      assert
        .dom('[data-test-fileDetails-apiScan-progressStatus-title]')
        .hasText(t('capturedApiListTitle'));

      assert
        .dom('[data-test-fileDetails-apiScan-progressStatus-scannedCount]')
        .hasText(
          t('apiScanModule.endpointsScannedCount', { scanned: 2, total: 5 })
        );

      assert
        .dom('[data-test-fileDetails-apiScan-progressStatus-searchInput]')
        .exists();

      assert.dom('[data-test-fileDetails-apiScan-footerContainer]').exists();

      if (this.file.is_api_done) {
        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-completedChip]')
          .hasText(t('completed'));

        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-runningChip]')
          .doesNotExist();

        // A finished scan always reads as fully scanned
        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-progressText]')
          .hasText('100%');

        assert.dom('[data-test-fileDetails-apiScan-stopBtn]').doesNotExist();

        // Nothing was cancelled by a stop, so there is nothing to restart
        assert
          .dom('[data-test-fileDetails-apiScan-restartRemainingBtn]')
          .doesNotExist();

        assert
          .dom('[data-test-fileDetails-apiScan-rescanBtn]')
          .isNotDisabled()
          .hasText(t('apiScanModule.rescan'));
      } else {
        assert
          .dom('[data-test-fileDetails-apiScan-restartRemainingBtn]')
          .doesNotExist();

        assert.dom('[data-test-fileDetails-apiScan-rescanBtn]').doesNotExist();

        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-runningChip]')
          .hasText(t('running'));

        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-completedChip]')
          .doesNotExist();

        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-progressText]')
          .hasText(`${this.file.api_scan_progress}%`);

        assert
          .dom('[data-test-fileDetails-apiScan-stopBtn]')
          .isNotDisabled()
          .hasText(t('apiScanModule.stopScan'));
      }

      const rows = findAll(
        '[data-test-fileDetails-apiScan-progressStatus-row]'
      );

      assert.strictEqual(rows.length, API_SCAN_URLS.length);

      rows.forEach((row, idx) => {
        const url = API_SCAN_URLS[idx];

        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-method]', row)
          .hasText(url.request.method);

        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-endpoint]', row)
          .hasText(`https://api.example.com${url.request.path}`)
          .hasAttribute('title', `https://api.example.com${url.request.path}`);

        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-status]', row)
          .hasText(API_SCAN_URL_STATUS_LABEL[url.status]());

        // Only the endpoint being scanned shows a spinner
        if (url.status === API_SCAN_URL_STATUS.IN_PROGRESS) {
          assert
            .dom(
              '[data-test-fileDetails-apiScan-progressStatus-statusLoader]',
              row
            )
            .exists();
        } else {
          assert
            .dom(
              '[data-test-fileDetails-apiScan-progressStatus-statusLoader]',
              row
            )
            .doesNotExist();
        }

        if (url.scanned_on) {
          assert
            .dom(
              '[data-test-fileDetails-apiScan-progressStatus-scannedOn]',
              row
            )
            .doesNotHaveTextContaining('—');
        } else {
          assert
            .dom(
              '[data-test-fileDetails-apiScan-progressStatus-scannedOn]',
              row
            )
            .hasText('—');
        }
      });
    }
  );

  test('it filters scanned apis by endpoint search', async function (assert) {
    this.file.update({
      api_scan_status: ENUMS.SCAN_STATUS.RUNNING,
      is_api_done: false,
    });

    let lastQuery = null;

    setupApiScanUrlsEndpoint(this.server, (req) => {
      lastQuery = req.queryParams.q;
    });

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    assert.strictEqual(
      findAll('[data-test-fileDetails-apiScan-progressStatus-row]').length,
      API_SCAN_URLS.length
    );

    const searchInput =
      '[data-test-fileDetails-apiScan-progressStatus-searchInput]';

    await fillIn(searchInput, 'auth');
    await triggerKeyEvent(searchInput, 'keyup', 'H');

    assert.strictEqual(lastQuery, 'auth');

    const rows = findAll('[data-test-fileDetails-apiScan-progressStatus-row]');

    assert.strictEqual(rows.length, 2);

    assert
      .dom('[data-test-fileDetails-apiScan-progressStatus-endpoint]', rows[0])
      .hasText('https://api.example.com/api/v1/auth/session');

    // Counts describe the whole scan, not the search results
    assert
      .dom('[data-test-fileDetails-apiScan-progressStatus-scannedCount]')
      .hasText(
        t('apiScanModule.endpointsScannedCount', { scanned: 2, total: 5 })
      );

    await fillIn(searchInput, 'does-not-exist');
    await triggerKeyEvent(searchInput, 'keyup', 'T');

    assert
      .dom('[data-test-fileDetails-apiScan-progressStatus-empty]')
      .hasText(t('apiScanModule.noApiFound'));
  });

  test('stop button stops a running api scan', async function (assert) {
    this.file.update({
      api_scan_status: ENUMS.SCAN_STATUS.RUNNING,
      is_api_done: false,
      api_scan_progress: 40,
    });

    this.server.get('/v2/files/:id/capturedapis', (schema, req) => {
      const results = req.queryParams.is_active
        ? schema.db.capturedapis.where({ is_active: true })
        : schema.capturedapis.all().models;

      return { count: results.length, previous: null, next: null, results };
    });

    this.server.get('/v2/files/:id/capturedapis_domains', () => {
      return {
        project_profile_api_filters: [],
        auto_generated_api_filters: [],
      };
    });

    this.server.get('/v2/files/:id/toggle_captured_apis', () => {
      return { is_active: true };
    });

    this.server.post('/v2/files/:id/start_apiscan_v2/stop', (schema, req) => {
      const file = schema.files.find(req.params.id);

      if (!file) {
        return new Response(
          404,
          {},
          { detail: `file ${req.params.id} not found` }
        );
      }

      file.update({ is_api_scan_stop_requested: true });

      return new Response(204);
    });

    setupApiScanUrlsEndpoint(this.server);

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    assert
      .dom('[data-test-fileDetails-apiScan-stopBtn]')
      .isNotDisabled()
      .hasText(t('apiScanModule.stopScan'));

    assert.dom('[data-test-fileDetails-apiScan-stoppingBtn]').doesNotExist();

    await click('[data-test-fileDetails-apiScan-stopBtn]');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.errorMsg, null);
    assert.strictEqual(notify.successMsg, t('apiScanModule.scanStopped'));

    assert.dom('[data-test-fileDetails-apiScan-stopBtn]').doesNotExist();

    assert
      .dom('[data-test-fileDetails-apiScan-stoppingBtn]')
      .isDisabled()
      .hasText(t('apiScanModule.stoppingScan'));

    assert
      .dom('[data-test-fileDetails-apiScan-progressStatus-runningChip]')
      .doesNotExist();

    assert
      .dom('[data-test-fileDetails-apiScan-stoppingChip]')
      .hasText(t('stopping'));

    assert
      .dom('[data-test-fileDetails-dynamicScan-statusChip-loader]')
      .exists();

    assert
      .dom('[data-test-fileDetails-apiScan-progressStatus-progressText]')
      .hasText('40%');
  });

  test.each(
    'it restarts a completed api scan',
    [
      {
        btn: '[data-test-fileDetails-apiScan-rescanBtn]',
        endpoint: '/v2/files/:id/start_apiscan_v2',
      },
      {
        btn: '[data-test-fileDetails-apiScan-restartRemainingBtn]',
        endpoint: '/v2/files/:id/start_apiscan_v2/restart_remaining',
      },
    ],
    async function (assert, { btn, endpoint }) {
      this.file.update({
        api_scan_status: ENUMS.SCAN_STATUS.COMPLETED,
        is_api_done: true,
        api_scan_progress: 100,
      });

      setupApiScanUrlsEndpoint(this.server, undefined, STOPPED_API_SCAN_URLS);

      let requested = false;

      this.server.post(endpoint, (schema, req) => {
        requested = true;

        schema.files.find(req.params.id).update({
          api_scan_status: ENUMS.SCAN_STATUS.RUNNING,
          is_api_done: false,
          api_scan_progress: 40,
        });

        return new Response(204);
      });

      await visit(`/dashboard/file/${this.file.id}/api-scan`);

      await click(btn);

      assert.true(requested);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, null);

      // The reloaded file is running again, so the screen offers Stop
      assert
        .dom('[data-test-fileDetails-apiScan-progressStatus-runningChip]')
        .hasText(t('running'));

      assert
        .dom('[data-test-fileDetails-apiScan-stopBtn]')
        .hasText(t('apiScanModule.stopScan'));

      assert.dom('[data-test-fileDetails-apiScan-rescanBtn]').doesNotExist();

      assert
        .dom('[data-test-fileDetails-apiScan-progressStatus-progressText]')
        .hasText('40%');
    }
  );

  test('it shows the error when a restart fails', async function (assert) {
    this.file.update({
      api_scan_status: ENUMS.SCAN_STATUS.COMPLETED,
      is_api_done: true,
    });

    setupApiScanUrlsEndpoint(this.server, undefined, STOPPED_API_SCAN_URLS);

    this.server.post(
      '/v2/files/:id/start_apiscan_v2/restart_remaining',
      () => new Response(400, {}, { detail: 'Restart failed' })
    );

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    await click('[data-test-fileDetails-apiScan-restartRemainingBtn]');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.errorMsg, 'Restart failed');

    // Still completed, so both actions stay available to retry
    assert
      .dom('[data-test-fileDetails-apiScan-progressStatus-completedChip]')
      .exists();

    assert
      .dom('[data-test-fileDetails-apiScan-restartRemainingBtn]')
      .isNotDisabled();

    assert.dom('[data-test-fileDetails-apiScan-rescanBtn]').isNotDisabled();
  });

  test('it hides restart remaining when no endpoint is cancelled', async function (assert) {
    this.file.update({
      api_scan_status: ENUMS.SCAN_STATUS.COMPLETED,
      is_api_done: true,
    });

    // Some endpoints failed or never ran, but a stop cancelled none of them
    setupApiScanUrlsEndpoint(this.server);

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    assert
      .dom('[data-test-fileDetails-apiScan-restartRemainingBtn]')
      .doesNotExist();

    assert.dom('[data-test-fileDetails-apiScan-rescanBtn]').exists();
  });

  test('it disables restart actions for inactive files', async function (assert) {
    this.file.update({
      api_scan_status: ENUMS.SCAN_STATUS.COMPLETED,
      is_api_done: true,
      is_active: false,
    });

    setupApiScanUrlsEndpoint(this.server, undefined, STOPPED_API_SCAN_URLS);

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    assert
      .dom('[data-test-fileDetails-apiScan-restartRemainingBtn]')
      .isDisabled();

    assert.dom('[data-test-fileDetails-apiScan-rescanBtn]').isDisabled();
  });

  test('it should navigate to properly on tab click', async function (assert) {
    this.server.get('/v2/files/:id/capturedapis', (schema, req) => {
      const results = req.queryParams.is_active
        ? schema.db.capturedapis.where({ is_active: true })
        : schema.capturedapis.all().models;

      return { count: results.length, previous: null, next: null, results };
    });

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    const tabLink = (id) =>
      `[data-test-fileDetails-apiScan-tabs="${id}-tab"] a`;

    assert
      .dom(tabLink('api-scan'))
      .hasText(t('apiScan'))
      .hasClass(/active-shadow/);

    await click(tabLink('api-results'));

    assert
      .dom(tabLink('api-results'))
      .hasText(t('apiScanResults'))
      .hasClass(/active-shadow/);

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/api-scan/results`
    );

    await click(tabLink('api-scan'));

    assert
      .dom(tabLink('api-scan'))
      .hasText(t('apiScan'))
      .hasClass(/active-shadow/);

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/api-scan`
    );
  });

  test('it renders api scan results', async function (assert) {
    await visit(`/dashboard/file/${this.file.id}/api-scan/results`);

    assert.dom('[data-test-fileDetails-apiScan-breadcrumbContainer]').exists();

    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    assert
      .dom(
        "[data-test-fileDetails-apiScanResults-tabs='vulnerability-details-tab'] a"
      )
      .hasText(t('vulnerabilityDetails'))
      .hasClass(/active-line/);

    assert
      .dom('[data-test-fileDetails-apiScanResults-desc]')
      .hasText(t('apiScanResultsDesc'));

    // assert vulnerability table
    const headerCells = findAll('[data-test-vulnerability-analysis-thead] th');

    assert.strictEqual(headerCells.length, 2);

    assert.dom(headerCells[0]).hasText(t('impact'));
    assert.dom(headerCells[1]).hasText(t('title'));

    const rows = findAll('[data-test-vulnerability-analysis-row]');

    const apiAnalyses = this.analyses.filter((a) =>
      a.hasType(ENUMS.VULNERABILITY_TYPE.API)
    );

    assert.strictEqual(rows.length, apiAnalyses.length);

    // assert first row
    const firstRowCells = rows[0].querySelectorAll(
      '[data-test-vulnerability-analysis-cell]'
    );

    const analyses = apiAnalyses
      .slice()
      .sort((a, b) => b.computedRisk - a.computedRisk); // sort by computedRisk:desc

    const { label } = analysisRiskStatus([
      String(analyses[0].computedRisk),
      String(analyses[0].status),
      analyses[0].isOverriddenRisk,
    ]);

    assert
      .dom('[data-test-analysisRiskTag-label]', firstRowCells[0])
      .hasText(label);

    assert.dom(firstRowCells[1]).hasText(analyses[0].vulnerability.get('name'));
  });

  test('it disables start button for inactive files', async function (assert) {
    this.file.update({
      is_active: false,
    });

    this.server.get('/v2/files/:id/capturedapis', (schema, req) => {
      const results = req.queryParams.is_active
        ? schema.db.capturedapis.where({ is_active: true })
        : schema.capturedapis.all().models;

      return { count: results.length, previous: null, next: null, results };
    });

    this.server.put('/capturedapis/:id', (schema, req) => {
      const data = JSON.parse(req.requestBody);

      schema.db.capturedapis.update(`${req.params.id}`, {
        is_active: data.is_active,
      });

      return schema.capturedapis.find(`${req.params.id}`)?.toJSON();
    });

    await visit(`/dashboard/file/${this.file.id}/api-scan`);

    const apiEndpoints = findAll(
      '[data-test-fileDetails-apiScan-capturedApi-endpointContainer]'
    );

    assert.strictEqual(apiEndpoints.length, 10);

    assert
      .dom(
        '[data-test-fileDetails-apiScan-capturedApi-endpointSelectCheckbox]',
        apiEndpoints[0]
      )
      .isDisabled();

    assert.dom('[data-test-fileDetails-apiScan-actionBtn]').isDisabled();
  });
});
