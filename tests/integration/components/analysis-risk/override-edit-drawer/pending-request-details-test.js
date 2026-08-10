import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';
import { riskText } from 'irene/helpers/risk-text';

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

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  overriddenRiskInfo:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-overriddenRiskInfo]',
  requestOverriddenAsTitle:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-requestOverriddenAsTitle]',
  requestedRisk:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-requestedRisk]',
  overrideCriteria:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-overrideCriteria]',
  requestedDetailsTitle:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-requestedDetailsTitle]',
  requestedDetailsValue:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-requestedDetailsValue]',
  auditDetails:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-auditDetails]',
  auditChip: (label) =>
    `[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-auditChip="${label}"]`,
  approveBtn:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-approveBtn]',
  rejectBtn:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-rejectBtn]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AnalysisRisk::OverrideEditDrawer::PendingRequestDetails
  @dataModel={{this.dataModel}}
  @setAppBarData={{this.setAppBarData}}
  @setActiveComponent={{this.setActiveComponent}}
  @drawerCloseHandler={{this.drawerCloseHandler}}
/>`;

module(
  'Integration | Component | analysis-risk/override-edit-drawer/pending-request-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      // Must be registered before anything resolves the real service.
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');

      this.server.createList('organization', 1);

      this.server.createList('organization-me', 1, {
        is_owner: true,
        is_admin: true,
      });

      // Server Mocks
      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      // The nested risk tag reads the viewer's role, which resolves against
      // the selected organization.
      await this.owner.lookup('service:organization').load();

      const pushOverrideRequest = (payload = {}) => {
        const record = this.server.create(
          'analysis-override-request',
          'pending',
          payload
        );

        return store.push(
          store.normalize('analysis-override-request', record.toJSON())
        );
      };

      const buildDataModel = (overrideRequest, extra = {}) => ({
        vulnerabilityName: 'Insecure Data Storage',
        computedRisk: ENUMS.RISK.CRITICAL,
        pendingOverrideRequest: overrideRequest,
        ...extra,
      });

      this.setProperties({
        pushOverrideRequest,
        buildDataModel,
        appBarData: null,
        activeComponent: null,
        approveCalledWith: null,
        setAppBarData: (data) => this.set('appBarData', data),
        drawerCloseHandler: () => {},

        setActiveComponent: (component) =>
          this.set('activeComponent', component),
      });
    });

    // ─── Requested details ───────────────────────────────────────────────────
    test('it renders the requested risk, reason and audit chips', async function (assert) {
      const comment = 'This is a false positive';

      const overrideRequest = this.pushOverrideRequest({
        requested_status: ENUMS.RISK.NONE,
        comment,
      });

      this.dataModel = this.buildDataModel(overrideRequest);

      await render(TEMPLATE);

      assert
        .dom(selectors.requestOverriddenAsTitle)
        .hasText(t('editAnalysisRequest.requestOverriddenAs'));

      assert
        .dom(selectors.requestedRisk)
        .hasText(t(riskText([ENUMS.RISK.NONE])));

      assert
        .dom(selectors.requestedDetailsTitle)
        .hasText(t('editAnalysisRequest.requestedDetails'));

      assert.dom(selectors.requestedDetailsValue).hasText(comment);

      assert
        .dom(selectors.auditChip(t('requestedOn')))
        .containsText(dayjs(overrideRequest.createdOn).format('MMM DD, YYYY'));

      assert
        .dom(selectors.auditChip(t('editAnalysisRequest.requestedBy')))
        .containsText(overrideRequest.requestedBy.username);

      assert
        .dom(selectors.auditChip(t('editAnalysisRequest.requestedChange')))
        .exists();
    });

    test.each(
      'it renders the override criteria label only when the request carries one',
      [
        [ENUMS.ANALYSIS_OVERRIDE_CRITERIA.CURRENT_FILE, 'currentFileOnly'],
        [
          ENUMS.ANALYSIS_OVERRIDE_CRITERIA.ALL_FUTURE_UPLOAD,
          'allFutureAnalyses',
        ],
        [null, null],
      ],
      async function (assert, [criteria, expectedKey]) {
        this.dataModel = this.buildDataModel(
          this.pushOverrideRequest({ analysis_override_criteria: criteria })
        );

        await render(TEMPLATE);

        if (expectedKey) {
          assert.dom(selectors.overrideCriteria).hasText(t(expectedKey));
        } else {
          assert.dom(selectors.overrideCriteria).doesNotExist();
        }
      }
    );

    // ─── Approval view ───────────────────────────────────────────────────────
    test('without an approve handler it renders the read-only view', async function (assert) {
      this.dataModel = this.buildDataModel(this.pushOverrideRequest());

      await render(TEMPLATE);

      assert
        .dom(selectors.requestOverriddenAsTitle)
        .hasText(t('editAnalysisRequest.requestOverriddenAs'));

      assert.dom(selectors.approveBtn).doesNotExist();
      assert.dom(selectors.rejectBtn).doesNotExist();

      assert.deepEqual(this.appBarData, { title: t('overrideDetails') });
    });

    test('with an approve handler it renders the approval view', async function (assert) {
      this.dataModel = this.buildDataModel(this.pushOverrideRequest(), {
        approveOverrideHandler: () => this.set('approveCalledWith', 'called'),
        rejectOverrideHandler: () => {},
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.requestOverriddenAsTitle)
        .hasText(t('editAnalysisRequest.requestedUpdate'));

      assert
        .dom(selectors.auditChip(t('editAnalysisRequest.requestedSeverity')))
        .exists();

      assert.dom(selectors.approveBtn).hasText(t('approve'));
      assert.dom(selectors.rejectBtn).hasText(t('reject'));

      assert.deepEqual(this.appBarData, { title: t('approvalRequest') });
    });

    // ─── Actions ─────────────────────────────────────────────────────────────
    test('approving invokes the approve handler', async function (assert) {
      this.dataModel = this.buildDataModel(this.pushOverrideRequest(), {
        approveOverrideHandler: () => this.set('approveCalledWith', 'called'),
        rejectOverrideHandler: () => {},
      });

      await render(TEMPLATE);

      assert.strictEqual(this.approveCalledWith, null);

      await click(selectors.approveBtn);

      assert.strictEqual(this.approveCalledWith, 'called');
    });

    test('a failed approval notifies the error and keeps the approve action', async function (assert) {
      this.dataModel = this.buildDataModel(this.pushOverrideRequest(), {
        approveOverrideHandler: () => {
          throw new Error('Already reviewed');
        },
        rejectOverrideHandler: () => {},
      });

      await render(TEMPLATE);

      await click(selectors.approveBtn);

      assert.strictEqual(
        this.owner.lookup('service:notifications').errorMsg,
        'Already reviewed',
        'shows error notification'
      );

      assert.dom(selectors.approveBtn).hasText(t('approve'));
    });

    test('rejecting switches the drawer to the reject confirm view', async function (assert) {
      this.dataModel = this.buildDataModel(this.pushOverrideRequest(), {
        approveOverrideHandler: () => {},
        rejectOverrideHandler: () => {},
      });

      await render(TEMPLATE);

      assert.strictEqual(this.activeComponent, null);

      await click(selectors.rejectBtn);

      assert.strictEqual(
        this.activeComponent,
        'analysis-risk/override-edit-drawer/reject-confirm'
      );
    });
  }
);
