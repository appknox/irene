import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
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
    '[data-test-analysisDetails-editAnalysis-resetConfirm-confirmTitle]',
  noteTitle: '[data-test-analysisDetails-editAnalysis-resetConfirm-noteTitle]',
  successMsg:
    '[data-test-analysisDetails-editAnalysis-resetConfirm-successMsg]',
  resetAction: (label) =>
    `[data-test-analysisDetails-editAnalysis-resetConfirm-resetAction="${label}"]`,
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AnalysisRisk::OverrideEditDrawer::ResetConfirm
  @dataModel={{this.dataModel}}
  @setAppBarData={{this.setAppBarData}}
  @setActiveComponent={{this.setActiveComponent}}
/>`;

const RESET_CONFIRM_COMPONENT =
  'file-details/vulnerability-analysis-details/edit-analysis-button/reset-confirm';

module(
  'Integration | Component | analysis-risk/override-edit-drawer/reset-confirm',
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

      const pushAnalysis = (vulnerabilityPayload = {}) => {
        const vulnarabilityRecord = this.server.create(
          'vulnerability',
          vulnerabilityPayload
        );

        const vulnerability = store.push(
          store.normalize('vulnerability', {
            attributes: vulnarabilityRecord.toJSON(),
            id: vulnarabilityRecord.id,
            type: 'vulnerability',
          })
        );

        const analysisRecord = this.server.create('analysis', {
          vulnerability: vulnerability.id,
        });

        return store.push(store.normalize('analysis', analysisRecord.toJSON()));
      };

      const buildDataModel = (extra = {}) => ({
        vulnerabilityName: 'Insecure Data Storage',
        computedRisk: ENUMS.RISK.LOW,
        risk: ENUMS.RISK.CRITICAL,
        status: ENUMS.ANALYSIS.COMPLETED,
        isOverridden: true,
        overriddenRisk: ENUMS.RISK.LOW,
        overrideCriteria: ENUMS.ANALYSIS_OVERRIDE_CRITERIA.CURRENT_FILE,
        resetConfirmComponent: RESET_CONFIRM_COMPONENT,
        model: pushAnalysis(),
        ...extra,
      });

      this.setProperties({
        pushAnalysis,
        buildDataModel,
        appBarData: null,
        activeComponent: null,
        resetCalledWith: null,
        setAppBarData: (data) => this.set('appBarData', data),

        setActiveComponent: (component) =>
          this.set('activeComponent', component),
      });
    });

    test('it opens with the confirmation app bar title', async function (assert) {
      this.dataModel = this.buildDataModel({ resetOverrideHandler: () => {} });

      await render(TEMPLATE);

      assert.dom(selectors.confirmTitle).exists();
      assert.strictEqual(this.appBarData.title, t('confirmation'));
    });

    test('a successful reset shows the success view and updates the app bar', async function (assert) {
      this.dataModel = this.buildDataModel({
        resetOverrideHandler: (all) => this.set('resetCalledWith', all),
      });

      await render(TEMPLATE);

      assert.strictEqual(this.resetCalledWith, null);
      assert.dom(selectors.successMsg).doesNotExist();

      await click(selectors.resetAction(t('yes')));

      assert.false(this.resetCalledWith);
      assert.dom(selectors.successMsg).exists();
      assert.deepEqual(this.appBarData, { title: t('successMessage') });
    });

    test('a failed reset notifies the payload message and stays on the form', async function (assert) {
      this.dataModel = this.buildDataModel({
        resetOverrideHandler: () => {
          throw { payload: { message: 'Reset failed' } };
        },
      });

      await render(TEMPLATE);

      await click(selectors.resetAction(t('yes')));

      assert.strictEqual(
        this.owner.lookup('service:notifications').errorMsg,
        'Reset failed',
        'shows error notification'
      );

      assert.dom(selectors.successMsg).doesNotExist();
      assert.dom(selectors.confirmTitle).exists();
    });

    test('resetting a deprecated vulnerability is blocked with a notification', async function (assert) {
      this.dataModel = this.buildDataModel({
        model: this.pushAnalysis({ 'is-active': false }),
        resetOverrideHandler: (all) => this.set('resetCalledWith', all),
      });

      await render(TEMPLATE);

      await click(selectors.resetAction(t('yes')));

      assert.strictEqual(
        this.owner.lookup('service:notifications').errorMsg,
        t('vulnerabilityDeprecatedReadonly'),
        'shows deprecated notification'
      );

      assert.strictEqual(
        this.resetCalledWith,
        null,
        'reset handler is never called'
      );

      assert.dom(selectors.successMsg).doesNotExist();
    });

    test('cancelling returns to the override details view', async function (assert) {
      this.dataModel = this.buildDataModel({ resetOverrideHandler: () => {} });

      await render(TEMPLATE);

      assert.strictEqual(this.activeComponent, null);

      await click(selectors.resetAction(t('cancel')));

      assert.strictEqual(
        this.activeComponent,
        'analysis-risk/override-edit-drawer/override-details'
      );
    });
  }
);
