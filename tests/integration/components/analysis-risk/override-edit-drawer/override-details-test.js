import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';
import { riskText } from 'irene/helpers/risk-text';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  overriddenAsTitle:
    '[data-test-analysisRisk-overrideEditDrawer-overrideDetails-overriddenAsTitle]',
  overriddenRiskText:
    '[data-test-analysisRisk-overrideEditDrawer-overrideDetails-overriddenRiskText]',
  overriddenRiskCriteriaText:
    '[data-test-analysisRisk-overrideEditDrawer-overrideDetails-overriddenRiskCriteriaText]',
  reasonTitle:
    '[data-test-analysisRisk-overrideEditDrawer-overrideDetails-reasonTitle]',
  reasonValue:
    '[data-test-analysisRisk-overrideEditDrawer-overrideDetails-reasonValue]',
  editBtn:
    '[data-test-analysisRisk-overrideEditDrawer-overrideDetails-editBtn]',
  resetBtn:
    '[data-test-analysisRisk-overrideEditDrawer-overrideDetails-resetBtn]',
  auditDetails: (label) =>
    `[data-test-analysisRisk-overrideEditDrawer-overrideDetails-auditDetails="${label}"]`,
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AnalysisRisk::OverrideEditDrawer::OverrideDetails
  @dataModel={{this.dataModel}}
  @setAppBarData={{this.setAppBarData}}
  @setActiveComponent={{this.setActiveComponent}}
  @drawerCloseHandler={{this.drawerCloseHandler}}
/>`;

const ownerRole = { is_owner: true, is_admin: true };
const adminRole = { is_owner: false, is_admin: true };
const memberRole = { is_owner: false, is_admin: false };

module(
  'Integration | Component | analysis-risk/override-edit-drawer/override-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      this.server.createList('organization-me', 1, ownerRole);

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      await this.owner.lookup('service:organization').load();

      const buildDataModel = (extra = {}) => ({
        vulnerabilityName: 'Insecure Data Storage',
        computedRisk: ENUMS.RISK.LOW,
        risk: ENUMS.RISK.CRITICAL,
        status: ENUMS.ANALYSIS.COMPLETED,
        isOverridden: true,
        overriddenRisk: ENUMS.RISK.LOW,
        overriddenRiskComment: 'Accepted risk for this release',
        overriddenBy: 'owner@appknox.com',
        overriddenOn: dayjs().toISOString(),
        overrideCriteria: ENUMS.ANALYSIS_OVERRIDE_CRITERIA.CURRENT_FILE,
        ...extra,
      });

      this.setProperties({
        buildDataModel,
        appBarData: null,
        activeComponent: null,
        setAppBarData: (data) => this.set('appBarData', data),
        drawerCloseHandler: () => {},

        setActiveComponent: (component) =>
          this.set('activeComponent', component),
      });
    });

    // ─── Overridden details ──────────────────────────────────────────────────
    test('it renders the overridden risk, criteria and reason', async function (assert) {
      this.dataModel = this.buildDataModel();

      await render(TEMPLATE);

      assert
        .dom(selectors.overriddenAsTitle)
        .hasText(t('editOverrideVulnerability.overriddenAs'));

      assert
        .dom(selectors.overriddenRiskText)
        .hasText(t(riskText([ENUMS.RISK.LOW])));

      assert
        .dom(selectors.overriddenRiskCriteriaText)
        .hasText(t('currentFileOnly'));

      assert.dom(selectors.reasonTitle).hasText(t('reason'));

      assert
        .dom(selectors.reasonValue)
        .hasText('Accepted risk for this release');
    });

    test.each(
      'it renders the override criteria text for each criteria value',
      [
        [ENUMS.ANALYSIS_OVERRIDE_CRITERIA.CURRENT_FILE, 'currentFileOnly'],
        [
          ENUMS.ANALYSIS_OVERRIDE_CRITERIA.ALL_FUTURE_UPLOAD,
          'allFutureAnalyses',
        ],
      ],
      async function (assert, [criteria, expectedKey]) {
        this.dataModel = this.buildDataModel({ overrideCriteria: criteria });

        await render(TEMPLATE);

        assert
          .dom(selectors.overriddenRiskCriteriaText)
          .hasText(t(expectedKey));
      }
    );

    // ─── Audit details ───────────────────────────────────────────────────────
    test('it renders the audit details for the override', async function (assert) {
      this.dataModel = this.buildDataModel();

      await render(TEMPLATE);

      assert
        .dom(
          selectors.auditDetails(t('editOverrideVulnerability.overriddenBy'))
        )
        .containsText('owner@appknox.com');

      assert
        .dom(
          selectors.auditDetails(t('editOverrideVulnerability.overriddenOn'))
        )
        .exists();
    });

    test.each(
      'it renders the original to overridden severity only when both risks are present',
      [
        [ENUMS.RISK.CRITICAL, ENUMS.RISK.LOW, true],
        [null, ENUMS.RISK.LOW, false],
      ],
      async function (assert, [risk, overriddenRisk, severityVisible]) {
        this.dataModel = this.buildDataModel({ risk, overriddenRisk });

        await render(TEMPLATE);

        assert
          .dom(
            selectors.auditDetails(
              t('editOverrideVulnerability.overriddenSeverity')
            )
          )
          [severityVisible ? 'exists' : 'doesNotExist']();
      }
    );

    // ─── Edit / reset affordances ────────────────────────────────────────────
    test.each(
      'edit and reset buttons render only for owners and admins',
      [
        [ownerRole, true],
        [adminRole, true],
        [memberRole, false],
      ],
      async function (assert, [role, canEdit]) {
        this.server.db.organizationMes.update('1', role);

        this.dataModel = this.buildDataModel();

        await render(TEMPLATE);

        if (canEdit) {
          assert.dom(selectors.editBtn).hasText(t('edit'));
          assert.dom(selectors.resetBtn).hasText(t('resetOverride'));
        } else {
          assert.dom(selectors.editBtn).doesNotExist();
          assert.dom(selectors.resetBtn).doesNotExist();
        }
      }
    );

    test('clicking reset switches the drawer to the reset confirm view', async function (assert) {
      this.dataModel = this.buildDataModel();

      await render(TEMPLATE);

      assert.strictEqual(this.activeComponent, null);

      await click(selectors.resetBtn);

      assert.strictEqual(
        this.activeComponent,
        'analysis-risk/override-edit-drawer/reset-confirm'
      );
    });
  }
);
