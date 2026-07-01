import {
  click,
  currentURL,
  find,
  findAll,
  settled,
  visit,
  waitUntil,
} from '@ember/test-helpers';

import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import { faker } from '@faker-js/faker';
import { Response } from 'miragejs';

import ENUMS from 'irene/enums';
import WebsocketService from 'irene/services/websocket';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { withStubbedRfb } from 'irene/tests/helpers/rfb-stubs';

// ─── Selectors ────────────────────────────────────────────────────────────────

const SEL = {
  // Card & header
  breadcrumbContainer:
    '[data-test-fileDetails-dynamicScan-header-breadcrumbContainer]',
  fileSummary: '[data-test-fileDetailsSummary-root]',
  deviceHeaderText:
    '[data-test-fileDetails-dynamicScan-deviceWrapper-headerText]',
  deviceViewer:
    '[data-test-fileDetails-dynamicScan-deviceWrapper-deviceViewer]',
  fullscreenBtn:
    '[data-test-fileDetails-dynamicScan-deviceWrapper-deviceViewer-fullscreenBtn]',
  statusChip: '[data-test-fileDetails-dynamicScan-statusChip]',
  expiry: '[data-test-fileDetails-dynamicScan-expiry]',
  inProgressLoader: '[data-test-fileDetails-dynamicScan-inProgress-loader]',

  // Action button (with variants: startBtn, stopBtn, cancelBtn, restartBtn)
  action: '[data-test-fileDetails-dynamicScanAction]',
  actionBtn: (variant) =>
    `[data-test-fileDetails-dynamicScanAction="${variant}"]`,

  // Tabs
  tab: (id) => `[data-test-fileDetails-dynamicScan-header="${id}"]`,
  tabLink: (id) => `[data-test-fileDetails-dynamicScan-header="${id}"] a`,
  breadcrumbItem: (route) =>
    `[data-test-ak-breadcrumbs-auto-trail-item-key="${route}"]`,

  // Drawer
  drawer: {
    container: '[data-test-fileDetails-dynamicScanDrawer-drawerContainer]',
    title: '[data-test-fileDetails-dynamicScanDrawer-drawerContainer-title]',
    startBtn: '[data-test-fileDetails-dynamicScanDrawer-startBtn]',
  },

  // VNC viewer
  vnc: {
    root: '[data-test-vncViewer-root]',
    device: '[data-test-vncViewer-device]',
    canvas: '[data-test-NovncRfb-canvasContainer]',
    manualScanNote: '[data-test-vncViewer-manualScanNote]',
    automatedNote: '[data-test-vncViewer-automatedNote]',
    scanTriggeredNote: '[data-test-vncViewer-scanTriggeredNote]',
    scanTriggeredAuto: '[data-test-vncViewer-scanTriggeredAutomaticallyText]',
    scanStartedBy: '[data-test-vncViewer-scanStartedByText]',
  },

  // Confirm & notify-user modals
  confirm: {
    description: '[data-test-confirmbox-description]',
    confirmBtn: '[data-test-confirmbox-confirmBtn]',
    cancelBtn: '[data-test-confirmbox-cancelBtn]',
  },

  notifyUser: {
    header:
      '[data-test-fileDetailsDynamicScan-scheduledAutomated-notifyUserModalHeader]',
    confirmBtn:
      '[data-test-fileDetailsDynamicScan-scheduledAutomated-notifyUserModal-confirmBtn]',
    cancelBtn:
      '[data-test-fileDetailsDynamicScan-scheduledAutomated-notifyUserModal-cancelBtn]',
  },

  // User roles panel (automated multi-scan)
  userRoles: {
    root: '[data-test-fileDetails-dynamicScan-automated-userRoles-root]',
    pill: (name) =>
      `[data-test-fileDetails-dynamicScan-automated-userRoles-pillWrapper="${name}"]`,
  },

  // Interaction info banner (automated)
  interactionInfo: {
    icon: '[data-test-fileDetails-dynamicScan-automated-interactionInfoIcon]',
    text: '[data-test-fileDetails-dynamicScan-automated-interactionInfoText]',
  },

  // Results view
  results: {
    badge: '[data-test-fileDetails-dynamicScan-header-badge-count]',
    info: '[data-test-fileDetails-dynamicScan-info]',
    tab: (id) => `[data-test-fileDetails-dynamicScan-results-tabs='${id}'] a`,
    tableHead: '[data-test-vulnerability-analysis-thead] th',
    tableRow: '[data-test-vulnerability-analysis-row]',
    tableCell: '[data-test-vulnerability-analysis-cell]',
    riskTag: '[data-test-analysisRiskTag-label]',
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DAST_TABS = [
  { id: 'manual-dast-tab', label: 'dastTabs.manualDAST' },
  { id: 'automated-dast-tab', label: 'dastTabs.automatedDAST' },
  { id: 'dast-results-tab', label: 'dastTabs.dastResults' },
];

// Statuses that the automated view collapses under a single "starting" chip.
const STARTING_STATUSES = new Set([
  ENUMS.DYNAMIC_SCAN_STATUS.DEVICE_ALLOCATED,
  ENUMS.DYNAMIC_SCAN_STATUS.CONNECTING_TO_DEVICE,
  ENUMS.DYNAMIC_SCAN_STATUS.PREPARING_DEVICE,
  ENUMS.DYNAMIC_SCAN_STATUS.DOWNLOADING_AUTOPILOT_SCRIPT,
  ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_AUTOPILOT,
  ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING,
  ENUMS.DYNAMIC_SCAN_STATUS.LAUNCHING,
]);

const commonDynamicScanStatusTexts = [
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
    text: () => t('notStarted'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.PREPROCESSING,
    text: () => t('deviceInQueue'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.PROCESSING_SCAN_REQUEST,
    text: () => t('deviceInQueue'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
    text: () => t('deviceInQueue'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.DEVICE_ALLOCATED,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.CONNECTING_TO_DEVICE,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.PREPARING_DEVICE,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.DOWNLOADING_AUTOPILOT_SCRIPT,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_AUTOPILOT,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING,
    text: () => t('deviceInstalling'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.LAUNCHING,
    text: () => t('deviceLaunching'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_API_CAPTURE,
    text: () => t('deviceHooking'),
  },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.HOOKING, text: () => t('deviceHooking') },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.STOP_SCAN_REQUESTED,
    text: () => t('deviceShuttingDown'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.SCAN_TIME_LIMIT_EXCEEDED,
    text: () => t('deviceShuttingDown'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.SHUTTING_DOWN,
    text: () => t('deviceShuttingDown'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.CLEANING_DEVICE,
    text: () => t('deviceShuttingDown'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.RUNTIME_DETECTION_COMPLETED,
    text: () => t('deviceShuttingDown'),
  },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.ERROR, text: () => t('errored') },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.TIMED_OUT, text: () => t('errored') },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.TERMINATED, text: () => t('errored') },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED, text: () => t('cancelled') },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYZING,
    text: () => t('deviceCompleted'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
    text: () => t('deviceCompleted'),
  },
];

const manualDynamicScanStatusTexts = [
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
    text: () => t('running'),
    statusHidden: true,
  },
];

const autoDynamicScanStatusTexts = [
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_RUNNING,
    text: () => t('running'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_COMPLETED,
    text: () => t('running'),
  },
];

// ─── Service stubs ────────────────────────────────────────────────────────────

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

class WebsocketStub extends WebsocketService {
  async connect() {} //NOSONAR
  async configure() {} //NOSONAR
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

  setDefaultAutoClear() {} //NOSONAR
}

// ─── Mirage helpers ───────────────────────────────────────────────────────────

/**
 * Creates a dynamicscan record with the same defaults every test uses. Any
 * field may be overridden per test.
 */
function createDynamicscan(server, fileId, overrides = {}) {
  return server.create('dynamicscan', {
    file: fileId,
    mode: ENUMS.DYNAMIC_MODE.MANUAL,
    status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
    ended_on: null,
    ...overrides,
  });
}

/**
 * Stubs the two last-scan lookup endpoints so they resolve to `getScan()` only
 * when the mode matches the one being queried. `getScan()` is a thunk because
 * the scan record is often created lazily inside a POST handler.
 */
function stubLastScanEndpoints(server, { getScan, mode }) {
  server.get('/v3/files/:id/last_manual_dynamic_scan', (schema) => {
    const scan = getScan();

    const dynamicscan =
      scan && mode === 'manual'
        ? schema.dynamicscans.find(scan.id)?.toJSON()
        : null;

    return dynamicscan ? [dynamicscan] : [];
  });

  server.get('/v3/files/:id/last_automated_dynamic_scan', (schema) => {
    const scan = getScan();

    const dynamicscan =
      scan && mode === 'automated'
        ? schema.dynamicscans.find(scan.id)?.toJSON()
        : null;

    return dynamicscan ? [dynamicscan] : [];
  });
}

/**
 * Registers the profile-scoped endpoints shared by the start/stop and
 * scheduled tests.
 */
function stubProfileEndpoints(server, { proxyEnabled = false } = {}) {
  server.get('/v2/profiles/:id/ds_automated_device_preference', (schema, req) =>
    schema.dsAutomatedDevicePreferences.find(`${req.params.id}`)?.toJSON()
  );

  server.get('/v2/profiles/:id/ds_manual_device_preference', (schema, req) =>
    schema.dsManualDevicePreferences.find(`${req.params.id}`)?.toJSON()
  );

  server.get('/profiles/:id/api_scan_options', () => ({
    id: '1',
    ds_api_capture_filters: [],
  }));

  server.get('/profiles/:id/proxy_settings', () => ({
    id: '1',
    host: faker.internet.ip(),
    port: faker.internet.port(),
    enabled: proxyEnabled,
  }));

  server.get('/v2/projects/:projectId/scenarios', () => ({
    count: 0,
    next: null,
    previous: null,
    results: [],
  }));
}

/**
 * Stubs DELETE /v2/dynamicscans/:id to move the current scan into
 * STOP_SCAN_REQUESTED and return 204. `getScan()` is a thunk for the same
 * reason as `stubLastScanEndpoints`.
 */
function stubDeleteDynamicscan(server, getScan) {
  server.delete('/v2/dynamicscans/:id', () => {
    getScan().update({
      status: ENUMS.DYNAMIC_SCAN_STATUS.STOP_SCAN_REQUESTED,
    });

    return new Response(204);
  });
}

/**
 * Stubs POST /v2/files/:id/dynamicscans with configurable body assertions and
 * post-create hooks. Returns nothing; call `createScan()` inside the handler
 * to build the scan on demand.
 */
function stubStartDynamicscan(server, { onRequest, createScan, afterCreate }) {
  server.post('/v2/files/:id/dynamicscans', (schema, req) => {
    const body = JSON.parse(req.requestBody);
    onRequest?.(body);

    const scan = createScan();
    afterCreate?.(scan);

    return scan.toJSON();
  });
}

/**
 * Stubs the last-automated-scan endpoint to return an array of multiple scans,
 * with the `scenario_user_role` embedded so EmbeddedRecordsMixin resolves it.
 * Also stubs the manual endpoint to return an empty array.
 */
function stubLastAutomatedScansMulti(server, getScans) {
  server.get('/v3/files/:id/last_automated_dynamic_scan', (schema) => {
    return getScans()
      .map((s) => {
        const scan = schema.dynamicscans.find(String(s.id));

        if (!scan) {
          return null;
        }

        const json = scan.toJSON();
        const role = scan.scenarioUserRole;

        json.scenario_user_role = role
          ? { id: String(role.id), name: role.name }
          : null;

        return json;
      })
      .filter(Boolean);
  });

  server.get('/v3/files/:id/last_manual_dynamic_scan', () => []);
}

/**
 * Returns an async asserter that drives one scan-status transition end-to-end:
 * updates the mirage record, replays the WS notification, waits for the DOM
 * to reflect the new state, and asserts the status chip + action button.
 */
function makeScanStatusAsserter(owner, dynamicscan) {
  const store = owner.lookup('service:store');
  const websocket = owner.lookup('service:websocket');

  return async function assertScanStatus(
    assert,
    status,
    expectedStatusText,
    expectedAction = null
  ) {
    dynamicscan.update({ status });

    websocket.onConnect();

    websocket.onModelNotification({
      model_name: 'dynamicscan',
      data: dynamicscan.toJSON(),
    });

    await settled();

    await waitUntil(() => {
      const storeScan = store.peekRecord('dynamicscan', String(dynamicscan.id));
      const statusEl = find(SEL.statusChip);

      const actionEl = expectedAction
        ? find(SEL.actionBtn(expectedAction))
        : null;

      const statusMatches = expectedStatusText
        ? statusEl?.textContent.includes(expectedStatusText)
        : !statusEl;

      return (
        storeScan?.status === status &&
        statusMatches &&
        (!expectedAction || !actionEl?.disabled)
      );
    });

    if (expectedStatusText) {
      assert.dom(SEL.statusChip).hasText(expectedStatusText);
    } else {
      assert.dom(SEL.statusChip).doesNotExist();
    }

    if (expectedAction) {
      assert.dom(SEL.actionBtn(expectedAction)).isNotDisabled();
    }
  };
}

/**
 * Asserts the VNC-panel notes shown when a scan first enters IN_QUEUE, which
 * differ between automated (shows triggered/queued note) and manual modes.
 */
async function assertInQueueModeNotes(assert, mode, startedBy, user) {
  if (mode === 'automated') {
    assert.dom(SEL.vnc.manualScanNote).doesNotExist();
    assert.dom(SEL.vnc.scanTriggeredNote).exists();

    if (startedBy) {
      assert
        .dom(SEL.vnc.scanStartedBy)
        .hasText(`${t('scanStartedBy')} ${user.username}`);
    } else {
      assert
        .dom(SEL.vnc.scanTriggeredAuto)
        .hasText(t('scanTriggeredAutomatically'));
    }

    assert
      .dom(SEL.vnc.automatedNote)
      .hasText(`${t('note')} - ${t('automatedScanQueuedVncNote')}`);

    assert.dom(SEL.inProgressLoader).exists();
  } else {
    assert.dom(SEL.vnc.automatedNote).doesNotExist();
    assert.dom(SEL.vnc.scanTriggeredNote).doesNotExist();

    assert
      .dom(SEL.vnc.manualScanNote)
      .hasText(`${t('note')} - ${t('dynamicScanText')}`);
  }
}

/**
 * Either cancels mid-start (cancelInBetween=true) or advances through to the
 * running state and triggers the stop action, asserting state at each step.
 */
async function assertRunOrCancelFlow(
  assert,
  assertScanStatus,
  mode,
  cancelInBetween
) {
  if (cancelInBetween) {
    await click(SEL.actionBtn('cancelBtn'));

    return;
  }

  const { CONFIGURING_API_CAPTURE, READY_FOR_INTERACTION, AUTOPILOT_RUNNING } =
    ENUMS.DYNAMIC_SCAN_STATUS;

  await assertScanStatus(
    assert,
    CONFIGURING_API_CAPTURE,
    t('deviceHooking'),
    'cancelBtn'
  );

  await assertScanStatus(
    assert,
    mode === 'manual' ? READY_FOR_INTERACTION : AUTOPILOT_RUNNING,
    mode === 'manual' ? null : t('running'),
    mode === 'manual' ? 'stopBtn' : null
  );

  if (mode === 'automated') {
    assert.dom(SEL.vnc.scanTriggeredNote).exists();
    assert.dom(SEL.vnc.automatedNote).exists();
    assert.dom(SEL.vnc.canvas).doesNotExist();
  } else {
    assert.dom(SEL.vnc.manualScanNote).doesNotExist();
    assert.dom(SEL.expiry).exists();
    await click(SEL.actionBtn('stopBtn'));
  }
}

/**
 * Asserts the correct action button variant (or absence) for the given scan
 * state and interaction mode.
 */
function assertActionButton(assert, dynamicscan, isManualMode) {
  if (dynamicscan.isShuttingDown) {
    assert.dom(SEL.action).doesNotExist();
  } else if (dynamicscan.isStarting) {
    assert
      .dom(SEL.actionBtn('cancelBtn'))
      .isNotDisabled()
      .hasText(t('cancelScan'));
  } else if (dynamicscan.isReadyOrRunning) {
    if (isManualMode) {
      assert.dom(SEL.actionBtn('stopBtn')).isNotDisabled().hasText(t('stop'));
    } else {
      assert.dom(SEL.actionBtn('stopBtn')).doesNotExist();
    }
  } else if (dynamicscan.isCompleted || dynamicscan.isStatusError) {
    assert
      .dom(SEL.actionBtn('restartBtn'))
      .isNotDisabled()
      .hasText(isManualMode ? t('dynamicScan') : t('dastTabs.automatedDAST'));
  } else {
    assert
      .dom(SEL.actionBtn('startBtn'))
      .isNotDisabled()
      .hasText(isManualMode ? t('dynamicScan') : t('dastTabs.automatedDAST'));
  }
}

/**
 * Asserts VNC panel notes and the expiry strip for the current scan state and
 * interaction mode.
 */
function assertVncNotes(assert, dynamicscan, isManualMode) {
  if (isManualMode) {
    assert.dom(SEL.vnc.automatedNote).doesNotExist();
    assert.dom(SEL.vnc.scanTriggeredNote).doesNotExist();

    if (dynamicscan.isStarting) {
      assert
        .dom(SEL.vnc.manualScanNote)
        .hasText(`${t('note')} - ${t('dynamicScanText')}`);
    } else if (dynamicscan.isReadyOrRunning) {
      assert.dom(SEL.vnc.manualScanNote).doesNotExist();
      assert.dom(SEL.expiry).exists();
    }
  } else if (
    dynamicscan.isStartingOrShuttingInProgress ||
    dynamicscan.isReadyOrRunning
  ) {
    assert.dom(SEL.vnc.manualScanNote).doesNotExist();
    assert.dom(SEL.expiry).doesNotExist();
    assert.dom(SEL.vnc.automatedNote).exists();

    assert
      .dom(SEL.vnc.scanTriggeredAuto)
      .hasText(t('scanTriggeredAutomatically'));

    const expectedNote = dynamicscan.isInqueue
      ? `${t('note')} - ${t('automatedScanQueuedVncNote')}`
      : `${t('note')} - ${t('automatedScanRunningVncNote')}`;

    assert.dom(SEL.vnc.automatedNote).hasText(expectedNote);
  }
}

// ─── Module ───────────────────────────────────────────────────────────────────

module('Acceptance | file-details/dynamic-scan', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { vulnerabilities, organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    setupFileModelEndpoints(this.server);

    currentOrganizationMe.update({ has_security_permission: true });
    organization.update({ features: { dynamicscan_automation: true } });

    const store = this.owner.lookup('service:store');

    const project = this.server.create('project');
    const profile = this.server.create('profile', { id: '1' });

    const file = this.server.create('file', {
      id: '1',
      is_static_done: true,
      is_active: true,
      project: project.id,
      profile: profile.id,
      last_automated_dynamic_scan: null,
      last_manual_dynamic_scan: null,
    });

    const analyses = vulnerabilities.map((v, id) =>
      store.push(
        store.normalize(
          'analysis',
          this.server
            .create('analysis', { id, vulnerability: v.id, file: file.id })
            .toJSON()
        )
      )
    );

    // Service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.breadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    // Shared mirage endpoints
    this.server.get('/v2/server_configuration', () => ({
      devicefarm_url: 'https://devicefarm.app.com',
      websocket: '',
      enterprise: false,
    }));

    this.server.get('/v3/files/:id', (schema, req) =>
      schema.files.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/v3/projects/:id', (schema, req) =>
      schema.projects.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get(
      '/v2/projects/:id/scan_parameter_groups',
      (schema) => schema.scanParameterGroups.all().models
    );

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/v2/dynamicscans/:id', (schema, req) =>
      schema.dynamicscans.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('v2/profiles/:id/automation_preference', (_, req) => ({
      id: req.params.id,
      dynamic_scan_automation_enabled: true,
    }));

    this.setProperties({
      organization,
      file,
      profile,
      project,
      store,
      analyses,
    });
  });

  // ─── Rendering across statuses ─────────────────────────────────────────────

  test.each(
    'it renders DAST page with different states of scan status',
    [
      {
        route: 'manual',
        mode: ENUMS.DYNAMIC_MODE.MANUAL,
        statusTextList: [
          ...commonDynamicScanStatusTexts,
          ...manualDynamicScanStatusTexts,
        ],
      },
      {
        route: 'automated',
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
        statusTextList: [
          ...commonDynamicScanStatusTexts,
          ...autoDynamicScanStatusTexts,
        ],
      },
    ].flatMap(({ route, mode, statusTextList }) =>
      statusTextList.map((it) => ({ mode, route, ...it }))
    ),
    async function (assert, { mode, route, status, text, statusHidden }) {
      const isManualMode = mode === ENUMS.DYNAMIC_MODE.MANUAL;

      const { id } = createDynamicscan(this.server, this.file.id, {
        mode,
        status,
        ...(mode === ENUMS.DYNAMIC_MODE.AUTOMATED && {
          engine: ENUMS.DYNAMIC_SCAN_ENGINE.INTERNAL_MANUAL,
        }),
      });

      stubLastScanEndpoints(this.server, {
        getScan: () => this.server.schema.dynamicscans.find(id),
        mode: isManualMode ? 'manual' : 'automated',
      });

      await visit(`/dashboard/file/${this.file.id}/dynamic-scan/${route}`);

      // Breadcrumbs
      assert.dom(SEL.breadcrumbContainer).exists();

      this.breadcrumbsService.breadcrumbItems.map((item) => {
        assert
          .dom(SEL.breadcrumbItem(item.route))
          .exists()
          .containsText(item.title);
      });

      assert.dom(SEL.fileSummary).exists();

      DAST_TABS.forEach((item) => {
        assert.dom(SEL.tab(item.id)).containsText(t(item.label));
      });

      assert.dom(SEL.deviceHeaderText).hasText(t('realDevice'));

      const dynamicscan = this.store.peekRecord('dynamicscan', id);

      assert.strictEqual(
        dynamicscan.statusText,
        status == ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED ? t('unknown') : text()
      );

      // Status chip
      if (statusHidden) {
        assert.dom(SEL.statusChip).doesNotExist();
      } else {
        // The automated view collapses the STARTING bucket into a single chip.
        const expectedChipText =
          !isManualMode && STARTING_STATUSES.has(status)
            ? t('starting')
            : text();

        assert.dom(SEL.statusChip).hasText(expectedChipText);
      }

      // Action button
      assertActionButton(assert, dynamicscan, isManualMode);

      // Fullscreen + device viewer
      if (dynamicscan.isReady) {
        assert.dom(SEL.fullscreenBtn).isNotDisabled();
      } else {
        assert.dom(SEL.fullscreenBtn).doesNotExist();
      }

      assert.dom(SEL.deviceViewer).exists();

      assert
        .dom(SEL.vnc.root)
        .exists()
        .doesNotHaveClass(/vnc-viewer-fullscreen/);

      assert.dom(SEL.vnc.device).exists();

      if (dynamicscan.isReady) {
        assert.dom(SEL.vnc.canvas).exists();
      } else {
        assert.dom(SEL.vnc.canvas).doesNotExist();
      }

      // VNC notes per mode
      assertVncNotes(assert, dynamicscan, isManualMode);
    }
  );

  // ─── Start & stop / cancel ─────────────────────────────────────────────────

  test.each(
    'it should start & stop/cancel dynamic scan',
    [
      {
        mode: 'manual',
        cancelInBetween: false,
        expectedAssertions: 41,
        startedBy: false,
      },
      {
        mode: 'manual',
        cancelInBetween: true,
        expectedAssertions: 35,
        startedBy: false,
      },
      // cancelInBetween: false — stop while running not supported for automated yet.
      { mode: 'automated', expectedAssertions: 43, startedBy: true },
      {
        mode: 'automated',
        cancelInBetween: true,
        expectedAssertions: 37,
        startedBy: false,
      },
    ],
    async function (
      assert,
      { mode, cancelInBetween, expectedAssertions, startedBy }
    ) {
      assert.expect(expectedAssertions);

      const modeEnum = ENUMS.DYNAMIC_MODE[mode.toUpperCase()];

      const availableDevices = this.server.createList(
        'available-manual-device',
        3
      );

      this.server.create('ds-manual-device-preference', {
        id: this.profile.id,
        ds_manual_device_selection:
          ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE,
        ds_manual_device_identifier: availableDevices[0].device_identifier,
      });

      this.server.create('ds-automated-device-preference', {
        id: this.profile.id,
      });

      stubStartDynamicscan(this.server, {
        onRequest: (body) => {
          assert.strictEqual(body.mode, modeEnum);
          assert.false(body.enable_api_capture);
        },
        createScan: () => {
          this.dynamicscan = createDynamicscan(this.server, this.file.id, {
            mode: modeEnum,
            status: ENUMS.DYNAMIC_SCAN_STATUS.PREPROCESSING,
            started_by_user: startedBy ? this.profile.id : null,
            ...(mode === 'automated' && {
              engine: ENUMS.DYNAMIC_SCAN_ENGINE.INTERNAL_MANUAL,
            }),
          });
          return this.dynamicscan;
        },
        afterCreate: (scan) => {
          // Model-created WS notification triggers the header component to
          // reload the last automated scan (see websocket.ts:197 and
          // file-details/dynamic-scan/header/index.ts:61).
          const websocket = this.owner.lookup('service:websocket');

          websocket.onConnect();

          websocket.onModelCreatedNotification({
            model_name: 'dynamicscan',
            data: scan.toJSON(),
          });
        },
      });

      stubLastScanEndpoints(this.server, {
        getScan: () => this.dynamicscan,
        mode,
      });

      stubDeleteDynamicscan(this.server, () => this.dynamicscan);

      this.server.get('/v2/projects/:id/available_manual_devices', (schema) => {
        const results = schema.availableManualDevices.all().models;
        return { count: results.length, next: null, previous: null, results };
      });

      stubProfileEndpoints(this.server);

      const user = this.server.create('user', { id: this.profile.id });

      await visit(`/dashboard/file/${this.file.id}/dynamic-scan/${mode}`);

      assert.dom(SEL.breadcrumbContainer).exists();
      assert.dom(SEL.fileSummary).exists();
      assert.dom(SEL.deviceHeaderText).hasText(t('realDevice'));

      assert
        .dom(SEL.actionBtn('startBtn'))
        .isNotDisabled()
        .hasText(
          mode === 'manual' ? t('dynamicScan') : t('dastTabs.automatedDAST')
        );

      assert.dom(SEL.fullscreenBtn).doesNotExist();
      assert.dom(SEL.deviceViewer).exists();
      assert.dom(SEL.vnc.canvas).doesNotExist();

      // Open drawer
      await click(SEL.actionBtn('startBtn'));

      assert.dom(SEL.drawer.container).exists();

      assert
        .dom(SEL.drawer.title)
        .hasText(
          mode === 'manual'
            ? t('dastTabs.manualDAST')
            : t('dastTabs.automatedDAST')
        );

      assert
        .dom(SEL.drawer.startBtn)
        .isNotDisabled()
        .hasText(mode === 'manual' ? t('start') : t('scheduleAutomation'));

      // Start scan
      await click(SEL.drawer.startBtn);

      assert.dom(SEL.drawer.container).doesNotExist();

      const assertScanStatus = makeScanStatusAsserter(
        this.owner,
        this.dynamicscan
      );

      // Scan status flow
      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
        t('deviceInQueue'),
        'cancelBtn'
      );

      await assertInQueueModeNotes(assert, mode, startedBy, user);

      assert.dom(SEL.expiry).doesNotExist();

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.DEVICE_ALLOCATED,
        mode === 'automated' ? t('starting') : t('deviceBooting'),
        'cancelBtn'
      );

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING,
        mode === 'automated' ? t('starting') : t('deviceInstalling'),
        'cancelBtn'
      );

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.LAUNCHING,
        mode === 'automated' ? t('starting') : t('deviceLaunching'),
        'cancelBtn'
      );

      await assertRunOrCancelFlow(
        assert,
        assertScanStatus,
        mode,
        cancelInBetween
      );

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.SHUTTING_DOWN,
        t('deviceShuttingDown')
      );

      assert.dom(SEL.action).doesNotExist();

      await assertScanStatus(
        assert,
        cancelInBetween
          ? ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED
          : ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
        cancelInBetween ? t('cancelled') : t('deviceCompleted'),
        cancelInBetween ? 'startBtn' : 'restartBtn'
      );

      assert.dom(SEL.vnc.scanTriggeredNote).doesNotExist();
      assert.dom(SEL.vnc.automatedNote).doesNotExist();
      assert.dom(SEL.vnc.manualScanNote).doesNotExist();
      assert.dom(SEL.expiry).doesNotExist();
    }
  );

  // ─── Scheduled automated flow ──────────────────────────────────────────────

  test.each(
    'dynamic scan scheduled automated flow',
    [
      { notifyUser: true, assertions: 45 },
      { notifyUser: false, assertions: 46 },
      {
        notifyUser: true,
        withError: true,
        errorDetail: 'This scan has already been notified to the user.',
        assertions: 48,
      },
    ],
    async function (
      assert,
      { notifyUser, withError, errorDetail, assertions }
    ) {
      assert.expect(assertions);

      this.server.create('ds-automated-device-preference', {
        id: this.profile.id,
      });

      // Note: /v2/files/:id/dynamicscans (GET) is queried by the header
      // component to detect a running scan. The engine=2 & group_status=running
      // params are the load-bearing bits of that query.
      this.server.get('/v2/files/:id/dynamicscans', (schema, req) => {
        const { limit, mode, engine, group_status } = req.queryParams || {};

        assert.strictEqual(engine, '2');
        assert.strictEqual(group_status, 'running');

        const models = schema.dynamicscans.where({
          file: req.params.id,
          ...(mode ? { mode: Number(mode) } : {}),
        }).models;

        const results = limit ? models.slice(0, Number(limit)) : models;

        return { count: results.length, next: null, previous: null, results };
      });

      stubStartDynamicscan(this.server, {
        onRequest: (body) => {
          assert.strictEqual(body.mode, ENUMS.DYNAMIC_MODE.AUTOMATED);
          assert.false(body.enable_api_capture);
        },
        createScan: () => {
          this.dynamicscan = createDynamicscan(this.server, this.file.id, {
            mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
            engine: ENUMS.DYNAMIC_SCAN_ENGINE.INTERNAL_MANUAL,
          });

          return this.dynamicscan;
        },
      });

      stubLastScanEndpoints(this.server, {
        getScan: () => this.dynamicscan,
        mode: 'automated',
      });

      stubDeleteDynamicscan(this.server, () => this.dynamicscan);
      stubProfileEndpoints(this.server);

      this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => ({
        id: req.params.id,
        status: false,
      }));

      this.server.post('/hudson-api/notify/:id/success', () =>
        withError
          ? new Response(400, {}, { detail: errorDetail })
          : new Response(200, {}, {})
      );

      await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

      assert.dom(SEL.deviceHeaderText).hasText(t('realDevice'));

      assert
        .dom(SEL.actionBtn('startBtn'))
        .isNotDisabled()
        .hasText(t('dastTabs.automatedDAST'));

      assert.dom(SEL.vnc.canvas).doesNotExist();
      assert.dom(SEL.tab('scheduled-automated-dast-tab')).doesNotExist();

      // Open drawer
      await click(SEL.actionBtn('startBtn'));

      assert.dom(SEL.drawer.container).exists();
      assert.dom(SEL.drawer.title).hasText(t('dastTabs.automatedDAST'));

      assert
        .dom(SEL.drawer.startBtn)
        .isNotDisabled()
        .hasText(t('scheduleAutomation'));

      // Start scan
      await click(SEL.drawer.startBtn);

      assert.dom(SEL.drawer.container).doesNotExist();

      const assertScanStatus = makeScanStatusAsserter(
        this.owner,
        this.dynamicscan
      );

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
        t('deviceInQueue'),
        'cancelBtn'
      );

      assert.dom(SEL.vnc.manualScanNote).doesNotExist();
      assert.dom(SEL.vnc.scanTriggeredNote).exists();

      assert
        .dom(SEL.vnc.automatedNote)
        .hasText(`${t('note')} - ${t('automatedScanQueuedVncNote')}`);

      // Move to running state
      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.DEVICE_ALLOCATED,
        t('starting'),
        'cancelBtn'
      );

      assert
        .dom(SEL.vnc.automatedNote)
        .hasText(`${t('note')} - ${t('automatedScanRunningVncNote')}`);

      // Simulate a refresh via navigation away and back.
      await visit(`/dashboard/file/${this.file.id}`);
      await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

      assert
        .dom(SEL.tabLink('scheduled-automated-dast-tab'))
        .hasText(t('dastTabs.scheduledAutomatedDAST'));

      // Navigate to scheduled tab
      await click(SEL.tabLink('scheduled-automated-dast-tab'));

      assert.strictEqual(
        currentURL(),
        `/dashboard/file/${this.file.id}/dynamic-scan/scheduled-automated`
      );

      assert.dom(SEL.deviceHeaderText).hasText(t('realDevice'));
      assert.dom(SEL.actionBtn('startBtn')).doesNotExist();
      assert.dom(SEL.statusChip).hasText(t('starting'));
      assert.dom(SEL.actionBtn('cancelBtn')).isNotDisabled();

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
        null,
        'stopBtn'
      );

      assert.dom(SEL.vnc.canvas).exists();

      // Stop scan
      await click(SEL.actionBtn('stopBtn'));

      // Stop confirmation
      assert
        .dom(SEL.confirm.description)
        .containsText(t('modalCard.scheduledAutomatedStopConfirm.headerTitle'));

      assert.dom(SEL.confirm.confirmBtn).containsText(t('yes'));
      assert.dom(SEL.confirm.cancelBtn).containsText(t('no'));

      await click(SEL.confirm.confirmBtn);

      // Notify user modal
      assert
        .dom(SEL.notifyUser.header)
        .containsText(t('modalCard.scheduledAutomatedNotifyUser.headerTitle'));

      assert.dom(SEL.notifyUser.confirmBtn).containsText(t('yes'));
      assert.dom(SEL.notifyUser.cancelBtn).containsText(t('no'));

      if (notifyUser) {
        await assertScanStatus(
          assert,
          ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          t('deviceCompleted')
        );

        await click(SEL.notifyUser.confirmBtn);

        const notify = this.owner.lookup('service:notifications');

        const notifServiceMessage = withError
          ? notify.errorMsg
          : notify.successMsg;

        const expectedNotifMessage = withError
          ? errorDetail
          : t('modalCard.scheduledAutomatedNotifyUser.successMsg');

        assert.strictEqual(notifServiceMessage, expectedNotifMessage);

        // On error the modal stays open so the user can retry or dismiss.
        if (withError) {
          assert
            .dom(SEL.notifyUser.header)
            .containsText(
              t('modalCard.scheduledAutomatedNotifyUser.headerTitle')
            );

          assert.dom(SEL.notifyUser.confirmBtn).containsText(t('yes'));
          assert.dom(SEL.notifyUser.cancelBtn).containsText(t('no'));

          // Cancelling still redirects back to the automated tab.
          await click(SEL.notifyUser.cancelBtn);
        }
      } else {
        await click(SEL.notifyUser.cancelBtn);

        assert.dom(SEL.notifyUser.header).doesNotExist();
        assert.dom(SEL.notifyUser.confirmBtn).doesNotExist();
        assert.dom(SEL.notifyUser.cancelBtn).doesNotExist();
      }

      // Redirect back to the automated tab
      assert.strictEqual(
        currentURL(),
        `/dashboard/file/${this.file.id}/dynamic-scan/automated`
      );

      assert.dom(SEL.tab('scheduled-automated-dast-tab')).doesNotExist();

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.SHUTTING_DOWN,
        t('deviceShuttingDown')
      );

      assert.dom(SEL.action).doesNotExist();
    }
  );

  // ─── Multi-scan user role scenarios ──────────────────────────────────────────

  test.each(
    'cumulative status chip and action button (presence + text) reflect the highest-priority role across multiple user-role scans',
    [
      // ── Two roles ──────────────────────────────────
      // RUNNING beats everything; treatAsAutopiloted=true → stopBtn shown
      {
        statuses: [
          ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_RUNNING,
          ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
        ],
        expectedChipText: () => t('running'),
        expectedActionBtn: { selectorID: 'stopBtn', text: () => t('stop') },
      },
      // STOPPING beats STARTING / IN_QUEUE / COMPLETED; isStopping=true → button hidden
      {
        statuses: [
          ENUMS.DYNAMIC_SCAN_STATUS.SHUTTING_DOWN,
          ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
        ],
        expectedChipText: () => t('stopping'),
        expectedActionBtn: { selectorID: null },
      },
      // STARTING beats IN_QUEUE / COMPLETED; treatAsAutopiloted=true → cancelBtn shown
      {
        statuses: [
          ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING,
          ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
        ],
        expectedChipText: () => t('starting'),
        expectedActionBtn: {
          selectorID: 'cancelBtn',
          text: () => t('cancelScan'),
        },
      },
      // IN_QUEUE beats COMPLETED; treatAsAutopiloted=true → cancelBtn shown
      {
        statuses: [
          ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
          ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
        ],
        expectedChipText: () => t('inQueue'),
        expectedActionBtn: {
          selectorID: 'cancelBtn',
          text: () => t('cancelScan'),
        },
      },
      // All COMPLETED → COMPLETED; no incomplete scans → treatAsAutopiloted=true → restartBtn shown
      {
        statuses: [
          ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
        ],
        expectedChipText: () => t('completed'),
        expectedActionBtn: {
          selectorID: 'restartBtn',
          text: () => t('dastTabs.automatedDAST'),
        },
      },
      // ERRORED beats COMPLETED; treatAsAutopiloted=true → restartBtn shown
      {
        statuses: [
          ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
        ],
        expectedChipText: () => t('errored'),
        expectedActionBtn: {
          selectorID: 'restartBtn',
          text: () => t('dastTabs.automatedDAST'),
        },
      },
      // ── Three roles ───────────────────────────────
      // RUNNING beats STARTING and IN_QUEUE; treatAsAutopiloted=true → stopBtn shown
      {
        statuses: [
          ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_RUNNING,
          ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING,
          ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
        ],
        expectedChipText: () => t('running'),
        expectedActionBtn: { selectorID: 'stopBtn', text: () => t('stop') },
      },
      // All STARTING → STARTING; treatAsAutopiloted=true → cancelBtn shown
      {
        statuses: [
          ENUMS.DYNAMIC_SCAN_STATUS.DEVICE_ALLOCATED,
          ENUMS.DYNAMIC_SCAN_STATUS.PREPARING_DEVICE,
          ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_AUTOPILOT,
        ],
        expectedChipText: () => t('starting'),
        expectedActionBtn: {
          selectorID: 'cancelBtn',
          text: () => t('cancelScan'),
        },
      },
    ],
    async function (assert, { statuses, expectedChipText, expectedActionBtn }) {
      const { selectorID } = expectedActionBtn;
      const btnTestCountFactor = selectorID ? 2 : 1;

      assert.expect(2 + btnTestCountFactor);

      this.server.create('ds-automated-device-preference', {
        id: this.profile.id,
      });

      const roles = this.server.createList(
        'scenario-user-role',
        statuses.length
      );

      const scans = statuses.map((status, i) =>
        createDynamicscan(this.server, this.file.id, {
          mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
          engine: ENUMS.DYNAMIC_SCAN_ENGINE.AUTOPILOT,
          status,
          scenarioUserRole: roles[i],
        })
      );

      stubLastAutomatedScansMulti(this.server, () => scans);
      stubProfileEndpoints(this.server);

      await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

      assert.dom(SEL.userRoles.root).exists();
      assert.dom(SEL.statusChip).hasText(expectedChipText());

      if (selectorID) {
        assert.dom(SEL.actionBtn(selectorID)).exists();
        assert.dom(SEL.actionBtn(selectorID)).hasText(expectedActionBtn.text());
      } else {
        assert.dom(SEL.action).doesNotExist();
      }
    }
  );

  test('cancelling automated scans only cancels starting or running scans', async function (assert) {
    assert.expect(3);

    this.server.create('ds-automated-device-preference', {
      id: this.profile.id,
    });

    const roles = this.server.createList('scenario-user-role', 2);

    const scanProps = [
      [roles[0], ENUMS.DYNAMIC_SCAN_STATUS.LAUNCHING],
      [roles[1], ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED],
    ];

    const [scanA, scanB] = scanProps.map(([role, status]) =>
      createDynamicscan(this.server, this.file.id, {
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
        engine: ENUMS.DYNAMIC_SCAN_ENGINE.AUTOPILOT,
        status,
        scenarioUserRole: role,
      })
    );

    const deletedIds = [];

    this.server.delete('/v2/dynamicscans/:id', (schema, req) => {
      deletedIds.push(req.params.id);

      schema.dynamicscans
        .find(req.params.id)
        ?.update({ status: ENUMS.DYNAMIC_SCAN_STATUS.STOP_SCAN_REQUESTED });

      return new Response(204);
    });

    stubLastAutomatedScansMulti(this.server, () => [scanA, scanB]);
    stubProfileEndpoints(this.server);

    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

    // Cumulative: STARTING(LAUNCHING) + COMPLETED(ANALYSIS_COMPLETED) → STARTING wins
    assert.dom(SEL.statusChip).hasText(t('starting'));
    assert.dom(SEL.actionBtn('cancelBtn')).isNotDisabled();

    await click(SEL.actionBtn('cancelBtn'));

    // Advance scanA to a terminal state so pollDynamicScanStatusForSuperUser stops
    const scanARecord = this.server.schema.dynamicscans.find(String(scanA.id));
    scanARecord.update({ status: ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED });

    const websocket = this.owner.lookup('service:websocket');

    websocket.onConnect();

    websocket.onModelNotification({
      model_name: 'dynamicscan',
      data: scanARecord.toJSON(),
    });

    await settled();

    // Only scanA (isStarting) was deleted; scanB (isCompleted) was skipped
    assert.deepEqual(deletedIds, [String(scanA.id)]);
  });

  test('stopping automated scans only stops running or starting scans', async function (assert) {
    assert.expect(3);

    // Statuses
    const { AUTOPILOT_RUNNING, ANALYSIS_COMPLETED, STOP_SCAN_REQUESTED } =
      ENUMS.DYNAMIC_SCAN_STATUS;

    this.server.create('ds-automated-device-preference', {
      id: this.profile.id,
    });

    const [roleA, roleB] = this.server.createList('scenario-user-role', 2);

    const scanProps = [
      [roleA, AUTOPILOT_RUNNING],
      [roleB, ANALYSIS_COMPLETED],
    ];

    const [scanA, scanB] = scanProps.map(([role, status]) =>
      createDynamicscan(this.server, this.file.id, {
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
        engine: ENUMS.DYNAMIC_SCAN_ENGINE.AUTOPILOT,
        status,
        scenarioUserRole: role,
      })
    );

    const deletedIds = [];

    this.server.delete('/v2/dynamicscans/:id', (schema, req) => {
      deletedIds.push(req.params.id);

      schema.dynamicscans
        .find(req.params.id)
        ?.update({ status: STOP_SCAN_REQUESTED });

      return new Response(204);
    });

    stubLastAutomatedScansMulti(this.server, () => [scanA, scanB]);
    stubProfileEndpoints(this.server);

    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

    // Cumulative: RUNNING(AUTOPILOT_RUNNING) + COMPLETED → RUNNING wins.
    // treatAsAutopiloted=true (all non-completed scans are AUTOPILOT) → stopBtn shown.
    assert.dom(SEL.statusChip).hasText(t('running'));
    assert.dom(SEL.actionBtn('stopBtn')).isNotDisabled();

    await click(SEL.actionBtn('stopBtn'));

    // Update scan record to a completed state
    const scanARecord = this.server.schema.dynamicscans.find(String(scanA.id));
    const websocket = this.owner.lookup('service:websocket');

    scanARecord.update({ status: ANALYSIS_COMPLETED });
    websocket.onConnect();

    websocket.onModelNotification({
      model_name: 'dynamicscan',
      data: scanARecord.toJSON(),
    });

    await settled();

    // Only scanA (isReadyOrRunning) was deleted; scanB (isCompleted) was skipped
    assert.deepEqual(deletedIds, [String(scanA.id)]);
  });

  test('switching between active user roles creates a new VNC connection', async function (assert) {
    assert.expect(6);

    this.server.create('ds-automated-device-preference', {
      id: this.profile.id,
    });

    const roles = this.server.createList('scenario-user-role', 2);

    // Both scans are AUTOPILOT_RUNNING so isReadyOrRunning is true for each.
    const scans = roles.map((role) =>
      createDynamicscan(this.server, this.file.id, {
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
        engine: ENUMS.DYNAMIC_SCAN_ENGINE.AUTOPILOT,
        status: ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_RUNNING,
        scenarioUserRole: role,
        moriarty_dynamicscan_token: faker.string.uuid(),
      })
    );

    const [tokenA, tokenB] = scans.map((s) => s.moriarty_dynamicscan_token);

    stubLastAutomatedScansMulti(this.server, () => scans);
    stubProfileEndpoints(this.server);

    // Stubbed RFB stubs WebSocket and ResizeObserver for the duration of the test.
    // Important to check if a new connection is opened when the role is switched.
    await withStubbedRfb(async (sockets) => {
      await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

      assert.dom(SEL.userRoles.root).exists();
      assert.dom(SEL.vnc.canvas).exists();

      assert.strictEqual(
        sockets.length,
        1,
        'RFB opens a connection for the initially selected scan'
      );

      assert.true(
        sockets[0].url.includes(tokenA),
        'initial connection targets the first scan token'
      );

      await click(SEL.userRoles.pill(roles[1].name));

      assert.strictEqual(
        sockets.length,
        2,
        'RFB opens a new connection after switching roles'
      );

      assert.true(
        sockets[1].url.includes(tokenB),
        'new connection targets the switched scan token'
      );
    });
  });

  // ─── Tab navigation ────────────────────────────────────────────────────────

  test('it should navigate properly on tab click', async function (assert) {
    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/manual`);

    assert
      .dom(SEL.tabLink('manual-dast-tab'))
      .hasText(t('dastTabs.manualDAST'))
      .hasClass(/active-shadow/);

    await click(SEL.tabLink('automated-dast-tab'));

    assert
      .dom(SEL.tabLink('automated-dast-tab'))
      .hasText(t('dastTabs.automatedDAST'))
      .hasClass(/active-shadow/);

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/dynamic-scan/automated`
    );

    await click(SEL.tabLink('dast-results-tab'));

    assert
      .dom(SEL.tabLink('dast-results-tab'))
      .containsText(t('dastTabs.dastResults'))
      .hasClass(/active-shadow/);

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/dynamic-scan/results`
    );
  });

  // ─── Results view ──────────────────────────────────────────────────────────

  test('it renders dynamic scan results', async function (assert) {
    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/results`);

    assert.dom(SEL.breadcrumbContainer).exists();
    assert.dom(SEL.fileSummary).exists();

    if (this.file.dynamicVulnerabilityCount) {
      assert
        .dom(SEL.results.badge)
        .exists()
        .containsText(this.file.dynamicVulnerabilityCount);
    }

    assert
      .dom(SEL.results.tab('vulnerability-details-tab'))
      .hasText(t('vulnerabilityDetails'))
      .hasClass(/active-line/);

    assert.dom(SEL.results.info).exists().containsText(t('dastResultsInfo'));

    const headerCells = findAll(SEL.results.tableHead);

    assert.strictEqual(headerCells.length, 2);
    assert.dom(headerCells[0]).hasText(t('impact'));
    assert.dom(headerCells[1]).hasText(t('title'));

    const rows = findAll(SEL.results.tableRow);
    const dynamicAnalyses = this.analyses.filter((a) =>
      a.hasType(ENUMS.VULNERABILITY_TYPE.DYNAMIC)
    );

    assert.strictEqual(rows.length, dynamicAnalyses.length);

    const firstRowCells = rows[0].querySelectorAll(SEL.results.tableCell);
    const sortedAnalyses = dynamicAnalyses
      .slice()
      .sort((a, b) => b.computedRisk - a.computedRisk);

    const { label } = analysisRiskStatus([
      String(sortedAnalyses[0].computedRisk),
      String(sortedAnalyses[0].status),
      sortedAnalyses[0].isOverriddenRisk,
    ]);

    assert.dom(SEL.results.riskTag, firstRowCells[0]).hasText(label);

    assert
      .dom(firstRowCells[1])
      .hasText(sortedAnalyses[0].vulnerability.get('name'));
  });
});
