import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { ReachabilityScanStatus } from 'irene/utils/sbom-reachability';

// ─── Selectors ───
const selectors = {
  analyzing: '[data-test-sbomComponent-reachabilityAnalyzing]',
  notRun: '[data-test-sbomComponent-reachabilityNotRun]',
  notRunTooltip: '[data-test-sbomComponent-reachabilityNotRunTooltip]',
  notApplicable: '[data-test-sbomComponent-reachabilityNotApplicable]',
  chip: '[data-test-sbomReachability-status]',
  counts: '[data-test-sbomComponent-reachabilityCounts]',
  countsTooltip: '[data-test-sbomComponent-reachabilityCountsTooltip]',
  notInBinary: '[data-test-sbomComponent-reachabilityNotInBinary]',
};

// ─── Template ───
const TEMPLATE = hbs`
  <Sbom::ScanDetails::ComponentList::Reachability
    @sbomComponent={{this.sbomComponent}}
  />
`;

// ─── Helpers ───
/**
 * Push a linked sbom-file + sbom-component pair so the cell can read the
 * scan status through the component's async sbFile relationship.
 */
function setupCell(store, { scanStatus, error = '', reachability }) {
  const file = store.push({
    data: {
      type: 'sbom-file',
      id: '1',
      attributes: {
        reachabilityStatus: scanStatus,
        reachabilityError: error,
      },
    },
  });

  const sbomComponent = store.push({
    data: {
      type: 'sbom-component',
      id: '10',
      attributes: {
        name: 'guava',
        reachability,
      },
      relationships: {
        sbFile: { data: { type: 'sbom-file', id: file.id } },
      },
    },
  });

  return sbomComponent;
}

module(
  'Integration | Component | sbom/scan-details/component-list/reachability',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    // ─── Running ────────────────────────────────────────────────────────────
    test.each(
      'it shows an analyzing chip while the scan is running',
      [[ReachabilityScanStatus.PENDING], [ReachabilityScanStatus.IN_PROGRESS]],
      async function (assert, [scanStatus]) {
        const store = this.owner.lookup('service:store');

        this.sbomComponent = setupCell(store, {
          scanStatus,
          reachability: null,
        });

        await render(TEMPLATE);

        assert
          .dom(selectors.analyzing)
          .hasText(t('sbomModule.reachability.analyzing'));
        assert.dom(selectors.chip).doesNotExist();
      }
    );

    // ─── Not run ────────────────────────────────────────────────────────────
    test.each(
      'it shows a muted dash with the reason on hover when the scan did not run',
      [
        [
          ReachabilityScanStatus.FAILED,
          'reachability failed: GRAPH_CACHE_INVALID',
        ],
        [ReachabilityScanStatus.SKIPPED, 'unsupported artifact format'],
      ],
      async function (assert, [scanStatus, reason]) {
        const store = this.owner.lookup('service:store');

        this.sbomComponent = setupCell(store, {
          scanStatus,
          error: reason,
          reachability: null,
        });

        await render(TEMPLATE);

        assert.dom(selectors.notRun).hasText('-');
        assert.dom(selectors.analyzing).doesNotExist();

        await triggerEvent(find(selectors.notRunTooltip), 'mouseenter');

        assert.dom('[data-test-ak-tooltip-content]').containsText(reason);
      }
    );

    // ─── Not applicable ─────────────────────────────────────────────────────
    test('it shows N/A for a completed scan with no vulnerable findings', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomComponent = setupCell(store, {
        scanStatus: ReachabilityScanStatus.COMPLETED,
        reachability: null,
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.notApplicable)
        .hasText(t('sbomModule.reachability.notApplicable'));
      assert.dom(selectors.chip).doesNotExist();
    });

    // ─── Findings ───────────────────────────────────────────────────────────
    test('it shows the worst-exposure chip, the counts badge and a bucket tooltip', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomComponent = setupCell(store, {
        scanStatus: ReachabilityScanStatus.COMPLETED,
        reachability: {
          verdict: 'CONFIRMED_REACHABLE',
          exposure: 'CONFIRMED_EXPOSURE',
          code_presence: 'PRESENT',
          path_found_count: 2,
          potential_count: 1,
          no_path_found_count: 1,
          unknown_count: 1,
          advisory_count: 5,
        },
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.chip)
        .hasText(t('sbomModule.reachability.pathFound'));
      assert.dom(selectors.counts).hasText('2/5');
      assert.dom(selectors.notInBinary).doesNotExist();

      await triggerEvent(find(selectors.countsTooltip), 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .containsText(
          `2 ${t('sbomModule.reachability.pathFound')} · 1 ${t(
            'sbomModule.reachability.potential'
          )} · 1 ${t('sbomModule.reachability.noPathFound')} · 1 ${t(
            'sbomModule.reachability.inconclusive'
          )}`
        );
    });

    // ─── All unknown ───────────────────────────────────────────────────────
    test('it shows an inconclusive chip instead of a dash when every verdict is unknown', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomComponent = setupCell(store, {
        scanStatus: ReachabilityScanStatus.COMPLETED,
        reachability: {
          verdict: 'UNKNOWN',
          exposure: 'UNKNOWN',
          path_found_count: 0,
          potential_count: 0,
          no_path_found_count: 0,
          unknown_count: 3,
          advisory_count: 3,
        },
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.chip)
        .hasText(t('sbomModule.reachability.inconclusive'));
      assert.dom(selectors.counts).hasText('0/3');
    });

    // ─── Not in binary ─────────────────────────────────────────────────────
    test('it shows a not-in-binary badge when the engine did not find the code', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomComponent = setupCell(store, {
        scanStatus: ReachabilityScanStatus.COMPLETED,
        reachability: {
          verdict: 'UNKNOWN',
          exposure: 'UNKNOWN',
          code_presence: 'NOT_OBSERVED',
          path_found_count: 0,
          potential_count: 0,
          no_path_found_count: 0,
          unknown_count: 2,
          advisory_count: 2,
        },
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.notInBinary)
        .hasText(t('sbomModule.reachability.notInBinary'));
    });
  }
);
