import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import ENUMS from 'irene/enums';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  pendingBanner:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-banner]',
  pendingRequestedDetailsTitle:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-requestedDetailsTitle]',
  pendingApproveBtn:
    '[data-test-analysisRisk-overrideEditDrawer-pendingRequestDetails-approveBtn]',
  detailsOverriddenAsTitle:
    '[data-test-analysisRisk-overrideEditDrawer-overrideDetails-overriddenAsTitle]',
  formOverrideToLabel:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-overrideToLabel]',
  formSaveBtn:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-saveBtn]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AnalysisRisk::OverrideEditDrawer::Content
  @dataModel={{this.dataModel}}
  @setAppBarData={{this.setAppBarData}}
  @drawerCloseHandler={{this.drawerCloseHandler}}
/>`;

module(
  'Integration | Component | analysis-risk/override-edit-drawer/content',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      this.server.createList('organization-me', 1, {
        is_owner: true,
        is_admin: true,
      });

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      // The nested risk tag resolves the viewer's role against the org.
      await this.owner.lookup('service:organization').load();

      const store = this.owner.lookup('service:store');

      const pushOverrideRequest = (trait = 'pending') => {
        const record = this.server.create('analysis-override-request', trait);

        return store.push(
          store.normalize('analysis-override-request', record.toJSON())
        );
      };

      const buildDataModel = (extra = {}) => ({
        vulnerabilityName: 'Insecure Data Storage',
        computedRisk: ENUMS.RISK.CRITICAL,
        risk: ENUMS.RISK.CRITICAL,
        status: ENUMS.ANALYSIS.COMPLETED,
        overrideCriteriaOptions: [
          { label: t('currentFileOnly'), value: 'current_file' },
        ],
        ...extra,
      });

      this.setProperties({
        pushOverrideRequest,
        buildDataModel,
        setAppBarData: () => {},
        drawerCloseHandler: () => {},
      });
    });

    // ─── Active component selection ──────────────────────────────────────────
    test('a pending override request renders the pending request details', async function (assert) {
      this.dataModel = this.buildDataModel({
        pendingOverrideRequest: this.pushOverrideRequest(),
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.pendingRequestedDetailsTitle)
        .hasText(t('editAnalysisRequest.requestedDetails'));

      assert.dom(selectors.detailsOverriddenAsTitle).doesNotExist();
      assert.dom(selectors.formOverrideToLabel).doesNotExist();
    });

    test('an overridden analysis without a pending request renders the override details', async function (assert) {
      this.dataModel = this.buildDataModel({
        isOverridden: true,
        overriddenRisk: ENUMS.RISK.LOW,
        overriddenRiskComment: 'Accepted risk',
        overrideCriteria: 'current_file',
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.detailsOverriddenAsTitle)
        .hasText(t('editOverrideVulnerability.overriddenAs'));

      assert.dom(selectors.formOverrideToLabel).doesNotExist();
      assert.dom(selectors.pendingRequestedDetailsTitle).doesNotExist();
    });

    test('a non-overridden analysis without a pending request renders the override form', async function (assert) {
      this.dataModel = this.buildDataModel({ isOverridden: false });

      await render(TEMPLATE);

      assert
        .dom(selectors.formOverrideToLabel)
        .hasText(t('editOverrideVulnerability.overrideTo'));

      assert.dom(selectors.detailsOverriddenAsTitle).doesNotExist();
      assert.dom(selectors.pendingRequestedDetailsTitle).doesNotExist();
    });

    // ─── Pending banner ──────────────────────────────────────────────────────
    test('a pending request without an approve handler shows the pending banner', async function (assert) {
      this.dataModel = this.buildDataModel({
        pendingOverrideRequest: this.pushOverrideRequest(),
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.pendingBanner)
        .hasText(t('editAnalysisRequest.pendingStatus'));
    });

    test('a pending request in the approval view hides the pending banner', async function (assert) {
      this.dataModel = this.buildDataModel({
        pendingOverrideRequest: this.pushOverrideRequest(),
        approveOverrideHandler: () => {},
        rejectOverrideHandler: () => {},
      });

      await render(TEMPLATE);

      assert.dom(selectors.pendingBanner).doesNotExist();
      assert.dom(selectors.pendingApproveBtn).hasText(t('approve'));
    });

    test('an approved override request hides the pending banner', async function (assert) {
      this.dataModel = this.buildDataModel({
        pendingOverrideRequest: this.pushOverrideRequest('approved'),
        isOverridden: true,
        overriddenRisk: ENUMS.RISK.LOW,
        overriddenRiskComment: 'Accepted risk',
        overrideCriteria: 'current_file',
      });

      await render(TEMPLATE);

      assert.dom(selectors.pendingBanner).doesNotExist();

      assert
        .dom(selectors.detailsOverriddenAsTitle)
        .hasText(t('editOverrideVulnerability.overriddenAs'));
    });
  }
);
