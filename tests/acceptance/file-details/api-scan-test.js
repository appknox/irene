import {
  click,
  currentURL,
  find,
  findAll,
  triggerEvent,
  visit,
} from '@ember/test-helpers';

import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { Response } from 'miragejs';
import { t } from 'ember-intl/test-support';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

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

module('Acceptance | file-details/api-scan', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { vulnerabilities } = await setupRequiredEndpoints(this.server);

    const analyses = vulnerabilities.map((v, id) =>
      this.server.create('analysis', { id, vulnerability: v.id }).toJSON()
    );

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
      analyses,
    });

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
    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.setProperties({
      file,
      capturedApis,
      store: this.owner.lookup('service:store'),
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
    this.server.get('/v2/files/1/capturedapis', (schema, req) => {
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

      this.server.post('/v2/files/:id/start_apiscan', () =>
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
        .dom(
          `[data-test-fileDetails-apiScan-progressStatus-svg="${this.file.is_api_done ? 'completed' : 'in-progress'}"]`
        )
        .exists();

      assert
        .dom('[data-test-fileDetails-apiScan-progressStatus-title]')
        .hasText(this.file.is_api_done ? t('apiScan') : t('apiScanInProgress'));

      if (this.file.is_api_done) {
        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-completedChip]')
          .hasText(t('chipStatus.completed'));
      } else {
        assert
          .dom('[data-test-fileDetails-apiScan-progressStatus-progressText]')
          .hasText(`${t('scanning')}... ${this.file.api_scan_progress}%`);
      }

      assert.strictEqual(
        find(
          '[data-test-fileDetails-apiScan-progressStatus-helperText]'
        ).innerHTML.trim(),
        t('apiScanProgressStatusHelper', {
          status: this.file.is_api_done ? 'completed' : 'running',
          htmlSafe: true,
        })
          .toString()
          .trim()
      );
    }
  );

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

    const file = this.store.peekRecord('file', this.file.id);

    const apiAnalyses = file.analyses.filter((a) =>
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
