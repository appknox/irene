import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

import ENUMS from 'irene/enums';
import { Response } from 'miragejs';
import {
  disableKnoxiqForTests,
  enableKnoxiqForTests,
  setupFileExploitabilityMirageEndpoint,
  setupKnoxiqScanStatusMirage,
} from 'irene/tests/helpers/knoxiq-test-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

// Each row exercises a distinct code-path inside knoxiqStatusCardConfig.
// sast/dast drive the real getter; state is what we assert on the rendered card.
const STATUS_CARD_SCENARIOS = [
  {
    label: 'SAST RUNNING → running state',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.RUNNING,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true },
    state: 'running',
  },
  {
    label: 'SAST PENDING → running state',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.PENDING,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true },
    state: 'running',
  },
  {
    label: 'DAST RUNNING → running state',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.RUNNING,
    fileAttrs: { isStaticDone: true, isDynamicDone: true },
    state: 'running',
  },
  {
    label: 'both COMPLETED → completed state',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    fileAttrs: { isStaticDone: true, isDynamicDone: true },
    state: 'completed',
  },
  {
    label: 'static done, SAST NOT_TRIGGERED → active state',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true },
    state: 'active',
  },
  {
    label: 'SAST done + dynamic done → active state (dast-ready)',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true, isDynamicDone: true, isManualDone: false },
    state: 'active',
  },
  {
    label: 'SAST done + dynamic NOT done → inactive state',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: {
      isStaticDone: true,
      isDynamicDone: false,
      isManualDone: false,
    },
    state: 'inactive',
  },
  {
    label: 'SAST ERRORED → failed state',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.ERRORED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true },
    state: 'failed',
  },
  {
    label: 'DAST ERRORED → failed state',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.ERRORED,
    fileAttrs: { isStaticDone: true, isDynamicDone: true },
    state: 'failed',
  },
];

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

module('Integration | Component | file-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    this.owner.register('service:notifications', NotificationsStub);

    setupFileModelEndpoints(this.server);
    setupFileExploitabilityMirageEndpoint(this.server);

    const store = this.owner.lookup('service:store');
    const project = this.server.create('project', { id: '1' });
    store.push(store.normalize('project', project.toJSON()));
    const profile = this.server.create('profile');
    const file = this.server.create('file', { project: project.id });

    this.file = store.push(
      store.normalize('file', {
        ...file.toJSON(),
        project: project.id,
        profile: profile.id,
      })
    );

    this.file.set('project', store.peekRecord('project', project.id));

    await this.owner.lookup('service:organization').load();

    enableKnoxiqForTests(this, { automated: false });

    const organizations = this.server.schema.organizations.all().models;
    const orgId = organizations[0]?.id;

    if (orgId) {
      this.server.create('organization-me', { id: orgId });
    }

    this.server.get('/organizations/:id/me', (schema, req) =>
      schema.organizationMes.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => ({
      id: req.params.id,
      status: true,
    }));

    this.server.get('/v3/projects/:id', (_, req) => ({
      id: req.params.id,
    }));

    this.server.get('/manualscans/:id', (_, req) => ({
      id: req.params.id,
    }));

    this.server.post('/knoxiq/file/:fileId/knoxiq_scan', () => ({}));

    this.server.get('/knoxiq/analyses/:analysisId/findings', () => ({
      count: 0,
      next: null,
      previous: null,
      results: [],
    }));

    this.fileAnalysesListContext = {
      analyses: [],
      isFetchingAnalyses: false,
      allAnalysesCVSSAreLatest: true,
    };
  });

  test('shows legacy vulnerability table when no KnoxIQ scan has completed', async function (assert) {
    this.file.isStaticDone = true;
    this.file.isKnoxiqAutomated = false;

    setupKnoxiqScanStatusMirage(this.server, {
      sast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
      dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    });

    await render(hbs`
      <FileDetails
        @file={{this.file}}
        @fileAnalysesListContext={{this.fileAnalysesListContext}}
      />
    `);

    assert.dom('[data-test-knoxiq-vulnerability-analysis]').doesNotExist();
    assert.dom('[data-test-vulnerability-analysis-emptyTitle]').exists();
  });

  test('card is absent when knoxiq is automated', async function (assert) {
    this.file.isKnoxiqAutomated = true;
    this.file.isStaticDone = true;

    setupKnoxiqScanStatusMirage(this.server, {
      sast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
      dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    });

    await render(hbs`
      <FileDetails
        @file={{this.file}}
        @fileAnalysesListContext={{this.fileAnalysesListContext}}
      />
    `);

    assert.dom('[data-test-knoxiq-status-card]').doesNotExist();
  });

  test.each(
    'card renders with correct state driven by real sast/dast scan statuses',
    STATUS_CARD_SCENARIOS,
    async function (assert, scenario) {
      Object.assign(this.file, scenario.fileAttrs);
      this.file.isKnoxiqAutomated = false;

      setupKnoxiqScanStatusMirage(this.server, {
        sast: scenario.sast,
        dast: scenario.dast,
      });

      await render(hbs`
        <FileDetails
          @file={{this.file}}
          @fileAnalysesListContext={{this.fileAnalysesListContext}}
        />
      `);

      await waitFor('[data-test-knoxiq-status-card]', { timeout: 5000 });

      assert.dom('[data-test-knoxiq-status-card]').exists(scenario.label);
      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(
          new RegExp(`status-card-icon-${scenario.state}`),
          scenario.label
        );
    }
  );

  module('superuser bypass for a KnoxIQ-disabled org', function () {
    // FileDetailsComponent reads `me.org.is_superuser` only once, synchronously,
    // in its constructor. In the real app this is always already resolved by
    // then (the parent `authenticated` route awaits `me.getMembership()` in
    // its model hook before any nested route renders), so mirror that here by
    // awaiting the me service's own fetch before rendering the component.
    async function makeSuperuser(context) {
      context.server.schema.organizationMes.first().update({
        is_superuser: true,
      });

      await context.owner.lookup('service:me').fetchOrganizationMe();
    }

    test('does not fetch or show KnoxIQ status when org KnoxIQ is disabled and the viewer is not a superuser', async function (assert) {
      disableKnoxiqForTests(this);
      this.file.isStaticDone = true;

      setupKnoxiqScanStatusMirage(this.server, {
        sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
        dast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
      });

      await render(hbs`
        <FileDetails
          @file={{this.file}}
          @fileAnalysesListContext={{this.fileAnalysesListContext}}
        />
      `);

      assert.dom('[data-test-knoxiq-status-card]').doesNotExist();
    });

    test('a superuser can see already-completed KnoxIQ status even when the file org has KnoxIQ disabled', async function (assert) {
      await makeSuperuser(this);
      disableKnoxiqForTests(this);
      this.file.isStaticDone = true;

      setupKnoxiqScanStatusMirage(this.server, {
        sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
        dast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
      });

      await render(hbs`
        <FileDetails
          @file={{this.file}}
          @fileAnalysesListContext={{this.fileAnalysesListContext}}
        />
      `);

      await waitFor('[data-test-knoxiq-status-card]', { timeout: 5000 });

      assert.dom('[data-test-knoxiq-status-card]').exists();
      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-completed/);
    });

    test('a superuser never sees the run-KnoxIQ trigger CTA for a file whose org has KnoxIQ disabled', async function (assert) {
      await makeSuperuser(this);
      disableKnoxiqForTests(this);
      this.file.isStaticDone = true;

      setupKnoxiqScanStatusMirage(this.server, {
        sast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
        dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
      });

      await render(hbs`
        <FileDetails
          @file={{this.file}}
          @fileAnalysesListContext={{this.fileAnalysesListContext}}
        />
      `);

      assert.dom('[data-test-knoxiq-status-card]').doesNotExist();
    });

    test('quietly ignores an expected 403 when a superuser probes a disabled org file with no KnoxIQ history yet', async function (assert) {
      await makeSuperuser(this);
      disableKnoxiqForTests(this);
      this.file.isStaticDone = true;

      this.server.get('/knoxiq/file/:fileId/knoxiq_scan/status', () => {
        return new Response(403);
      });

      await render(hbs`
        <FileDetails
          @file={{this.file}}
          @fileAnalysesListContext={{this.fileAnalysesListContext}}
        />
      `);

      const notifications = this.owner.lookup('service:notifications');

      assert.strictEqual(notifications.errorMsg, null);
      assert.dom('[data-test-knoxiq-status-card]').doesNotExist();
    });
  });
});
