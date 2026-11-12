import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import {
  FindingExposure,
  ReachabilityVerdict,
} from 'irene/utils/sbom-reachability';

const selectors = {
  root: '[data-test-sbomComponentVulnerabilities-reachability]',
  chip: '[data-test-sbomReachability-status]',
  empty: '[data-test-sbomReachability-empty]',
};

const TEMPLATE = hbs`
  <Sbom::ComponentDetails::Vulnerabilities::Reachability
    @sbomVulnerabilityAudit={{this.audit}}
  />
`;

module(
  'Integration | Component | sbom/component-details/vulnerabilities/reachability',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    test('the list chip follows exposure, matching the detail panel', async function (assert) {
      // The raw verdict says inconclusive, but the engine's exposure is the
      // customer-facing headline the detail panel shows.
      this.set('audit', {
        reachability: {
          verdict: ReachabilityVerdict.UNKNOWN,
          exposure: FindingExposure.POTENTIAL,
        },
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.chip)
        .hasText(t('sbomModule.reachability.potential'))
        .hasClass(/ak-chip-color-warn/);
    });

    test('a reachable exposure renders the solid error chip', async function (assert) {
      this.set('audit', {
        reachability: {
          verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
          exposure: FindingExposure.CONFIRMED,
        },
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.chip)
        .hasText(t('sbomModule.reachability.pathFound'))
        .hasClass(/ak-chip-color-error/)
        .hasClass(/ak-chip-variant-filled/);
    });

    test('without exposure it falls back to the verdict', async function (assert) {
      this.set('audit', {
        reachability: { verdict: ReachabilityVerdict.NO_PATH_FOUND },
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.chip)
        .hasText(t('sbomModule.reachability.noPathFound'));
    });

    test('a missing finding renders a dash', async function (assert) {
      this.set('audit', { reachability: null });

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.chip).doesNotExist();
      assert.dom(selectors.empty).hasText('-');
    });
  }
);
