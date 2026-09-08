import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

import ENUMS from 'irene/enums';
import { riskText } from 'irene/helpers/risk-text';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

const getRiskStatusObj = (
  risk,
  status = ENUMS.ANALYSIS.COMPLETED,
  isOverridden = false
) => analysisRiskStatus([risk, status, isOverridden]);

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: (label) => `[data-test-analysisRiskTag-root="${label}"]`,
  label: '[data-test-analysisRiskTag-label]',
  editIcon: '[data-test-analysisRiskTag-editIcon]',
  tooltipContent: '[data-test-analysisRiskTag-tooltipContent]',
  tooltipOriginalRisk: '[data-test-analysisRiskTag-tooltipOriginalRiskText]',
  tooltipOverriddenRisk:
    '[data-test-analysisRiskTag-tooltipOverriddenRiskText]',
  pendingIcon: '[data-test-analysisRiskTag-pendingIcon]',
  pendingTooltipContent: '[data-test-analysisRiskTag-pendingTooltipContent]',
  pendingOriginalRisk: '[data-test-analysisRiskTag-pendingOriginalRisk]',
  pendingRequestedRisk: '[data-test-analysisRiskTag-pendingRequestedRisk]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AnalysisRisk::Tag
  @computedRisk={{this.computedRisk}}
  @status={{this.status}}
  @isOverridden={{this.isOverridden}}
  @overriddenRisk={{this.overriddenRisk}}
  @originalRisk={{this.originalRisk}}
  @disableOverriddenTooltip={{this.disableOverriddenTooltip}}
  @isPending={{this.isPending}}
  @pendingRequestedRisk={{this.pendingRequestedRisk}}
  @isCapsule={{this.isCapsule}}
/>`;

const memberRole = { is_owner: false, is_admin: false };
const ownerRole = { is_owner: true, is_admin: true };

module('Integration | Component | analysis-risk/tag', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    // The component reads the viewer's role and the org feature flag.
    this.server.createList('organization', 1);
    this.server.createList('organization-me', 1, ownerRole);

    this.server.get('/organizations/:id/me', (schema, req) =>
      schema.organizationMes.find(`${req.params.id}`)?.toJSON()
    );

    const organization = this.owner.lookup('service:organization');
    await organization.load();

    this.setMemberOverrideRequestFeature = (enabled) =>
      organization.selected.set('features', {
        member_override_request: enabled,
      });
  });

  test.each(
    'it renders risk tag for different computedRisk correctly',
    [
      ENUMS.RISK.UNKNOWN,
      ENUMS.RISK.NONE,
      ENUMS.RISK.LOW,
      ENUMS.RISK.MEDIUM,
      ENUMS.RISK.HIGH,
      ENUMS.RISK.CRITICAL,
    ],
    async function (assert, computedRisk) {
      this.setProperties({ computedRisk });

      await render(TEMPLATE);

      const { label, cssclass } = getRiskStatusObj(this.computedRisk);

      assert.dom(selectors.root(label)).hasClass(new RegExp(cssclass));
      assert.dom(selectors.label).hasText(label);
      assert.dom(selectors.editIcon).doesNotExist();
    }
  );

  test.each(
    'it renders risk tag for different status correctly',
    [
      ENUMS.ANALYSIS.ERROR,
      ENUMS.ANALYSIS.WAITING,
      ENUMS.ANALYSIS.RUNNING,
      ENUMS.ANALYSIS.COMPLETED,
    ],
    async function (assert, status) {
      this.setProperties({ computedRisk: ENUMS.RISK.UNKNOWN, status });

      await render(TEMPLATE);

      const { label, cssclass } = getRiskStatusObj(
        this.computedRisk,
        this.status
      );

      assert.dom(selectors.root(label)).hasClass(new RegExp(cssclass));
      assert.dom(selectors.label).hasText(label);
      assert.dom(selectors.editIcon).doesNotExist();
    }
  );

  test.each(
    'it renders edit icon if risk is overidden & is not none and tooltip enable/disable',
    [false, true],
    async function (assert, disableOverriddenTooltip) {
      this.setProperties({
        computedRisk: ENUMS.RISK.HIGH,
        originalRisk: ENUMS.RISK.HIGH,
        overriddenRisk: ENUMS.RISK.LOW,
        isOverridden: true,
        disableOverriddenTooltip,
      });

      await render(TEMPLATE);

      const { label } = getRiskStatusObj(this.computedRisk);

      assert.dom(selectors.root(label)).exists();
      assert.dom(selectors.label).hasText(label);
      assert.dom(selectors.editIcon).exists();
      assert.dom(selectors.tooltipContent).doesNotExist();

      await triggerEvent(selectors.editIcon, 'mouseenter');

      if (disableOverriddenTooltip) {
        assert.dom(selectors.tooltipContent).doesNotExist();
        assert.dom(selectors.tooltipOriginalRisk).doesNotExist();
        assert.dom(selectors.tooltipOverriddenRisk).doesNotExist();
      } else {
        assert.dom(selectors.tooltipContent).containsText(t('overridden'));

        assert
          .dom(selectors.tooltipOriginalRisk)
          .hasText(t(riskText([this.originalRisk])));

        assert
          .dom(selectors.tooltipOverriddenRisk)
          .hasText(t(riskText([this.overriddenRisk])));
      }
    }
  );

  // ─── Capsule variant ─────────────────────────────────────────────────────────
  test.each(
    'an overridden tag renders the capsule edit icon or the overridden icon',
    [
      [true, /edit/],
      [false, null],
    ],
    async function (assert, [isCapsule, expectedIcon]) {
      this.setProperties({
        computedRisk: ENUMS.RISK.HIGH,
        originalRisk: ENUMS.RISK.HIGH,
        overriddenRisk: ENUMS.RISK.LOW,
        isOverridden: true,
        isCapsule,
      });

      await render(TEMPLATE);

      const { label } = getRiskStatusObj(this.computedRisk);

      assert.dom(selectors.root(label)).hasClass(/analysis-risk-tag/);
      assert.dom(selectors.label).hasText(label);

      if (expectedIcon) {
        assert.dom(selectors.editIcon).hasAttribute('icon', expectedIcon);
      } else {
        // The non-capsule variant renders an inline svg, not an AkIcon.
        assert.dom(selectors.editIcon).doesNotHaveAttribute('icon');
      }
    }
  );

  // ─── Pending approval icon ───────────────────────────────────────────────────
  test.each(
    'it shows the pending approval icon only for members when the org feature is on, a request is pending and the analysis is not overridden',
    [
      // [role, featureEnabled, isPending, isOverridden, iconVisible]
      [memberRole, true, true, false, true],
      [memberRole, false, true, false, false],
      [memberRole, true, false, false, false],
      [memberRole, true, true, true, false],
      [ownerRole, true, true, false, false],
    ],
    async function (
      assert,
      [role, featureEnabled, isPending, isOverridden, iconVisible]
    ) {
      this.server.db.organizationMes.update('1', role);
      this.setMemberOverrideRequestFeature(featureEnabled);

      this.setProperties({
        computedRisk: ENUMS.RISK.CRITICAL,
        pendingRequestedRisk: ENUMS.RISK.NONE,
        originalRisk: ENUMS.RISK.CRITICAL,
        overriddenRisk: isOverridden ? ENUMS.RISK.LOW : null,
        isPending,
        isOverridden,
      });

      await render(TEMPLATE);

      if (iconVisible) {
        assert
          .dom(selectors.pendingIcon)
          .hasAttribute('icon', /pending-actions-sharp/);
      } else {
        assert.dom(selectors.pendingIcon).doesNotExist();
      }
    }
  );

  test('the pending approval tooltip shows the requested risk change', async function (assert) {
    this.server.db.organizationMes.update('1', memberRole);
    this.setMemberOverrideRequestFeature(true);

    this.setProperties({
      computedRisk: ENUMS.RISK.CRITICAL,
      pendingRequestedRisk: ENUMS.RISK.NONE,
      originalRisk: ENUMS.RISK.CRITICAL,
      overriddenRisk: null,
      isPending: true,
      isOverridden: false,
    });

    await render(TEMPLATE);

    assert.dom(selectors.pendingTooltipContent).doesNotExist();

    await triggerEvent(selectors.pendingIcon, 'mouseenter');

    assert
      .dom(selectors.pendingTooltipContent)
      .containsText(t('pendingApproval'));

    assert
      .dom(selectors.pendingOriginalRisk)
      .hasText(t(riskText([ENUMS.RISK.CRITICAL])));

    assert
      .dom(selectors.pendingRequestedRisk)
      .hasText(t(riskText([ENUMS.RISK.NONE])));

    // The overridden-tag affordances stay out of the way while pending.
    assert.dom(selectors.editIcon).doesNotExist();
  });
});
