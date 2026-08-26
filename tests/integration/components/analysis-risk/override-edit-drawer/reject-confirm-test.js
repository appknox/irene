import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import ENUMS from 'irene/enums';

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
  confirmTitle:
    '[data-test-analysisDetails-editAnalysis-rejectConfirm-confirmTitle]',
  reasonInput:
    '[data-test-analysisDetails-editAnalysis-rejectConfirm-reasonInput]',
  cancelBtn: '[data-test-analysisDetails-editAnalysis-rejectConfirm-cancelBtn]',
  confirmBtn:
    '[data-test-analysisDetails-editAnalysis-rejectConfirm-confirmBtn]',
  successContainer:
    '[data-test-analysisDetails-editAnalysis-rejectConfirm-successContainer]',
  successMsg:
    '[data-test-analysisDetails-editAnalysis-rejectConfirm-successMsg]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AnalysisRisk::OverrideEditDrawer::RejectConfirm
  @dataModel={{this.dataModel}}
  @setAppBarData={{this.setAppBarData}}
  @setActiveComponent={{this.setActiveComponent}}
/>`;

const REJECT_CONFIRM_COMPONENT =
  'file-details/vulnerability-analysis-details/edit-analysis-button/reject-confirm';

module(
  'Integration | Component | analysis-risk/override-edit-drawer/reject-confirm',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      this.server.createList('organization', 1);

      this.server.createList('organization-me', 1, {
        is_owner: true,
        is_admin: true,
      });

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      await this.owner.lookup('service:organization').load();

      const store = this.owner.lookup('service:store');

      const overrideRequest = store.push(
        store.normalize(
          'analysis-override-request',
          this.server.create('analysis-override-request', 'pending').toJSON()
        )
      );

      const buildDataModel = (extra = {}) => ({
        vulnerabilityName: 'Insecure Data Storage',
        computedRisk: ENUMS.RISK.CRITICAL,
        risk: ENUMS.RISK.CRITICAL,
        status: ENUMS.ANALYSIS.COMPLETED,
        pendingOverrideRequest: overrideRequest,
        rejectConfirmComponent: REJECT_CONFIRM_COMPONENT,
        ...extra,
      });

      this.setProperties({
        overrideRequest,
        buildDataModel,
        appBarData: null,
        activeComponent: null,
        rejectCalledWith: null,
        setAppBarData: (data) => this.set('appBarData', data),

        setActiveComponent: (component) =>
          this.set('activeComponent', component),
      });
    });

    test('it renders the configured reject confirm component', async function (assert) {
      this.dataModel = this.buildDataModel({
        rejectOverrideHandler: () => {},
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.confirmTitle)
        .containsText(this.overrideRequest.requestedBy.email);

      assert.dom(selectors.confirmBtn).hasText(t('yesReject'));
      assert.dom(selectors.successContainer).doesNotExist();
    });

    test('a successful rejection shows the success view and updates the app bar', async function (assert) {
      this.dataModel = this.buildDataModel({
        rejectOverrideHandler: (reason) => this.set('rejectCalledWith', reason),
      });

      await render(TEMPLATE);

      assert.strictEqual(this.rejectCalledWith, null);
      assert.dom(selectors.successMsg).doesNotExist();

      await fillIn(selectors.reasonInput, 'Not a false positive');
      await click(selectors.confirmBtn);

      assert.strictEqual(this.rejectCalledWith, 'Not a false positive');

      assert
        .dom(selectors.successMsg)
        .hasText(t('editAnalysisRequest.rejectSuccessMessage'));

      assert.deepEqual(this.appBarData, { title: t('successMessage') });
    });

    test('a failed rejection notifies the error and stays on the form', async function (assert) {
      this.dataModel = this.buildDataModel({
        rejectOverrideHandler: () => {
          throw new Error('Reject failed');
        },
      });

      await render(TEMPLATE);

      await fillIn(selectors.reasonInput, 'Not a false positive');
      await click(selectors.confirmBtn);

      assert.strictEqual(
        this.owner.lookup('service:notifications').errorMsg,
        'Reject failed',
        'shows error notification'
      );

      assert.dom(selectors.successMsg).doesNotExist();
      assert.dom(selectors.confirmBtn).hasText(t('yesReject'));
    });

    test('cancelling returns to the pending request details view', async function (assert) {
      this.dataModel = this.buildDataModel({
        rejectOverrideHandler: () => {},
      });

      await render(TEMPLATE);

      assert.strictEqual(this.activeComponent, null);

      await click(selectors.cancelBtn);

      assert.strictEqual(
        this.activeComponent,
        'analysis-risk/override-edit-drawer/pending-request-details'
      );
    });
  }
);
