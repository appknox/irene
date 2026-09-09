import { find, render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import {
  pushAnalysisForKnoxiq,
  setupKnoxiqScanStatusMirage,
} from 'irene/tests/helpers/knoxiq-test-utils';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  banner: '[data-test-knoxiq-triageStatusBanner]',
  icon: '[data-test-knoxiq-triageStatusBanner-icon]',
  message: '[data-test-knoxiq-triageStatusBanner-message]',
  scanDetailsLink: '[data-test-knoxiq-triageStatusBanner-scanDetailsLink]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <KnoxIq::TriageStatusBanner @analysis={{this.analysis}} />
`;

const {
  NOT_TRIGGERED,
  PENDING,
  RUNNING,
  COMPLETED,
  DISABLED,
  LEGACY,
  ERRORED,
} = ENUMS.KNOXIQ_SCAN_STATUS;

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | knox-iq/triage-status-banner',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      this.server.create('project', { id: '1' });

      const orgId = this.server.schema.organizations.all().models[0]?.id;

      this.server.create('organization-me', { id: orgId });

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      // the file arrives over the wire on a first visit, like the real route
      this.server.get('/v3/files/:id', (schema, req) =>
        schema.files.find(req.params.id)?.toJSON()
      );

      this.store = this.owner.lookup('service:store');

      // Only replaceWith is swapped out — the real router stays in place for
      // anything else the component tree needs.
      this.router = this.owner.lookup('service:router');
      this.replaceWithArgs = null;

      this.router.replaceWith = (...args) => {
        this.replaceWithArgs = args;
      };

      await this.owner.lookup('service:organization').load();

      /**
       * Mirrors a first visit to the analysis route: only the analysis is in
       * the store, and the file, vulnerability and KnoxIQ scan status all have
       * to be fetched. Pushing those up front hides real bugs.
       */
      this.setupAnalysis = ({
        knoxiq = true,
        sast = NOT_TRIGGERED,
        dast = NOT_TRIGGERED,
        isKnoxiqAutomated = false,
        types = [ENUMS.VULNERABILITY_TYPE.STATIC],
      } = {}) => {
        const organization = this.owner.lookup('service:organization');

        organization.selected?.set('aiFeatures', {
          ...(organization.selected?.aiFeatures ?? {}),
          knoxiq,
        });

        this.server.create('file', {
          id: '1',
          project: '1',
          is_knoxiq_automated: isKnoxiqAutomated,
        });

        setupKnoxiqScanStatusMirage(this.server, { sast, dast });

        // the factory randomises types, and they decide visibility
        const vulnerability = this.server.create('vulnerability', { types });

        this.analysis = pushAnalysisForKnoxiq(this.server, this.store, {
          file: '1',
          vulnerability: vulnerability.id,
          computed_risk: ENUMS.RISK.HIGH,
          risk: ENUMS.RISK.HIGH,
        });
      };

      /**
       * The record the websocket pushes to as triage progresses. It only exists
       * once the component has fetched it.
       */
      this.loadedScan = () => this.store.peekRecord('knoxiq-scan', '1');
    });

    // ─── Not initiated ───────────────────────────────────────────────────────
    module('triaging not initiated', function () {
      test('warns and links out to the scan details page', async function (assert) {
        this.setupAnalysis({
          sast: NOT_TRIGGERED,
          isKnoxiqAutomated: false,
        });

        await render(TEMPLATE);

        assert.dom(selectors.message).hasText(t('knoxIq.triageNotInitiated'));

        assert.dom(selectors.icon).hasAttribute('icon', /warning/);

        assert
          .dom(selectors.scanDetailsLink)
          .hasText(t('scanDetails'))
          .hasAttribute('href', '/dashboard/file/1');
      });
    });

    // ─── First visit ─────────────────────────────────────────────────────────
    module('first visit', function () {
      test('shows the banner without the records being in the store', async function (assert) {
        this.setupAnalysis({ sast: RUNNING });

        assert.strictEqual(
          this.loadedScan(),
          null,
          'nothing is in the store before the component fetches it'
        );

        await render(TEMPLATE);

        assert
          .dom(selectors.message)
          .hasText(
            t('knoxIq.triageInProgress'),
            'the banner does not need a previous visit to have cached anything'
          );
      });
    });

    // ─── In progress ─────────────────────────────────────────────────────────
    module('triaging in progress', function () {
      test.each(
        'tells the user to come back later, with no link to follow',
        [[PENDING], [RUNNING]],
        async function (assert, [status]) {
          this.setupAnalysis({ sast: status, isKnoxiqAutomated: true });

          await render(TEMPLATE);

          assert.dom(selectors.message).hasText(t('knoxIq.triageInProgress'));
          assert.dom(selectors.icon).hasAttribute('icon', /warning/);

          assert
            .dom(selectors.scanDetailsLink)
            .doesNotExist('there is nothing for the user to trigger');
        }
      );

      test.each(
        'shows for a vulnerability KnoxIQ covers, whatever else it is tagged',
        [
          [[ENUMS.VULNERABILITY_TYPE.STATIC]],
          [[ENUMS.VULNERABILITY_TYPE.DYNAMIC]],

          // covered by SAST even though it is also an API finding
          [[ENUMS.VULNERABILITY_TYPE.STATIC, ENUMS.VULNERABILITY_TYPE.API]],
        ],
        async function (assert, [types]) {
          this.setupAnalysis({ sast: RUNNING, types });

          await render(TEMPLATE);

          assert.dom(selectors.message).hasText(t('knoxIq.triageInProgress'));
        }
      );

      test('shows the same message when a manual run is underway', async function (assert) {
        this.setupAnalysis({ sast: RUNNING, isKnoxiqAutomated: false });

        await render(TEMPLATE);

        assert.dom(selectors.message).hasText(t('knoxIq.triageInProgress'));
        assert.dom(selectors.scanDetailsLink).doesNotExist();
      });
    });

    // ─── Redirect on completion ──────────────────────────────────────────────
    module('redirect when the scan completes', function () {
      test('follows the analysis to the KnoxIQ layout', async function (assert) {
        this.setupAnalysis({ sast: RUNNING });

        await render(TEMPLATE);

        assert.dom(selectors.message).hasText(t('knoxIq.triageInProgress'));
        assert.strictEqual(this.replaceWithArgs, null, 'not yet redirected');

        // what the websocket's knoxiq-scan push amounts to
        this.loadedScan().set('sastStatus', COMPLETED);
        await settled();

        assert.dom(selectors.banner).doesNotExist();

        assert.deepEqual(this.replaceWithArgs, [
          'authenticated.dashboard.file.knox-analysis',
          '1',
          this.analysis.id,
        ]);
      });

      test.each(
        'stays put for any status short of completion',
        [[PENDING], [ERRORED]],
        async function (assert, [status]) {
          this.setupAnalysis({ sast: RUNNING });

          await render(TEMPLATE);

          this.loadedScan().set('sastStatus', status);
          await settled();

          assert.strictEqual(this.replaceWithArgs, null);
        }
      );

      test('leaves a deliberate visit to the original analysis alone', async function (assert) {
        // reached via the KnoxIQ page's "Original Analysis" link, so the scan
        // had already finished when the page opened and no banner is shown
        this.setupAnalysis({ sast: COMPLETED });

        await render(TEMPLATE);

        assert.dom(selectors.banner).doesNotExist();

        // a further push lands, the dynamic run having finished too
        this.loadedScan().set('dastStatus', COMPLETED);
        await settled();

        assert.strictEqual(
          this.replaceWithArgs,
          null,
          'nobody is pulled off the original analysis'
        );
      });

      test('follows a scan that starts and finishes while the page is open', async function (assert) {
        // the user is on the original analysis when a fresh run is triggered
        this.setupAnalysis({ sast: NOT_TRIGGERED, isKnoxiqAutomated: true });

        await render(TEMPLATE);

        assert.dom(selectors.banner).doesNotExist();

        this.loadedScan().set('sastStatus', RUNNING);
        await settled();

        assert.dom(selectors.message).hasText(t('knoxIq.triageInProgress'));

        this.loadedScan().set('sastStatus', COMPLETED);
        await settled();

        assert.deepEqual(this.replaceWithArgs, [
          'authenticated.dashboard.file.knox-analysis',
          '1',
          this.analysis.id,
        ]);
      });

      test('does not redirect out of the not-initiated state', async function (assert) {
        this.setupAnalysis({ sast: NOT_TRIGGERED });

        await render(TEMPLATE);

        assert.dom(selectors.message).hasText(t('knoxIq.triageNotInitiated'));

        this.loadedScan().set('sastStatus', COMPLETED);
        await settled();

        assert.strictEqual(
          this.replaceWithArgs,
          null,
          'the user never saw an in-progress banner to follow'
        );
      });
    });

    // ─── Hidden ──────────────────────────────────────────────────────────────
    module('hidden', function () {
      test.each(
        'stays out of the way when there is nothing to say',
        [
          // KnoxIQ is off for the org
          [{ knoxiq: false, sast: NOT_TRIGGERED }],

          // legacy file, KnoxIQ never applied to it
          [{ sast: LEGACY }],

          // KnoxIQ turned off for this project
          [{ sast: DISABLED, dast: DISABLED }],

          // already finished — the KnoxIQ view takes over
          [{ sast: COMPLETED }],

          // errored is surfaced by the status card on the scan details page
          [{ sast: ERRORED }],

          // automated mode never sits in NOT_TRIGGERED waiting on the user
          [{ sast: NOT_TRIGGERED, isKnoxiqAutomated: true }],

          // KnoxIQ triages SAST and DAST only — these never get a verdict
          [{ types: [ENUMS.VULNERABILITY_TYPE.API] }],
          [{ types: [ENUMS.VULNERABILITY_TYPE.MANUAL] }],
          [{ sast: RUNNING, types: [ENUMS.VULNERABILITY_TYPE.API] }],
        ],
        async function (assert, [options]) {
          this.setupAnalysis(options);

          await render(TEMPLATE);

          assert.dom(selectors.banner).doesNotExist();
          assert.strictEqual(find(selectors.message), null);
        }
      );
    });
  }
);
