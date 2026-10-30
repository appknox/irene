import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { ReachabilityVerdict } from 'irene/utils/sbom-reachability';

// ─── Selectors ───
const selectors = {
  chip: '[data-test-sbomReachability-status]',
  empty: '[data-test-sbomReachability-empty]',
  tooltip: '[data-test-sbomReachability-tooltip]',
};

// ─── Template ───
const TEMPLATE = hbs`
  <Sbom::ReachabilityStatus
    @verdict={{this.verdict}}
    @compact={{this.compact}}
    @tooltip={{this.tooltip}}
  />
`;

module('Integration | Component | sbom/reachability-status', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.setProperties({
      verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
      compact: false,
      tooltip: null,
    });
  });

  test.each(
    'it renders the chip for each verdict',
    [
      [
        ReachabilityVerdict.CONFIRMED_REACHABLE,
        'sbomModule.reachability.pathFound',
      ],
      [ReachabilityVerdict.REACHABLE, 'sbomModule.reachability.pathFound'],
      [ReachabilityVerdict.CONDITION_MET, 'sbomModule.reachability.pathFound'],
      [
        ReachabilityVerdict.POTENTIALLY_REACHABLE,
        'sbomModule.reachability.potential',
      ],
      [
        ReachabilityVerdict.CONDITION_POSSIBLY_MET,
        'sbomModule.reachability.potential',
      ],
      [
        ReachabilityVerdict.NO_PATH_FOUND,
        'sbomModule.reachability.noPathFound',
      ],
      [
        ReachabilityVerdict.CONDITION_NOT_MET,
        'sbomModule.reachability.noPathFound',
      ],
      [ReachabilityVerdict.UNKNOWN, 'sbomModule.reachability.inconclusive'],
      [ReachabilityVerdict.UNSUPPORTED, 'sbomModule.reachability.unsupported'],
    ],
    async function (assert, [verdict, labelKey]) {
      this.set('verdict', verdict);

      await render(TEMPLATE);

      assert.dom(selectors.chip).hasText(t(labelKey));
      assert.dom(selectors.empty).doesNotExist();
    }
  );

  test('compact mode shows unknown as inconclusive', async function (assert) {
    this.setProperties({
      verdict: ReachabilityVerdict.UNKNOWN,
      compact: true,
    });

    await render(TEMPLATE);

    assert
      .dom(selectors.chip)
      .hasText(t('sbomModule.reachability.inconclusive'));
    assert.dom(selectors.empty).doesNotExist();
  });

  test('compact mode still shows path found', async function (assert) {
    this.setProperties({
      verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
      compact: true,
    });

    await render(TEMPLATE);

    assert.dom(selectors.chip).hasText(t('sbomModule.reachability.pathFound'));
    assert.dom(selectors.empty).doesNotExist();
  });

  test('compact mode hides a missing verdict as a dash', async function (assert) {
    this.setProperties({
      verdict: null,
      compact: true,
    });

    await render(TEMPLATE);

    assert.dom(selectors.chip).doesNotExist();
    assert.dom(selectors.empty).hasText('-');
  });

  test('a server tooltip replaces the generic explanation on hover', async function (assert) {
    this.setProperties({
      verdict: ReachabilityVerdict.UNKNOWN,
      tooltip:
        'We found no call path, but a call may cross into native (C/C++) code that we cannot trace.',
    });

    await render(TEMPLATE);

    assert
      .dom(selectors.chip)
      .hasText(t('sbomModule.reachability.inconclusive'));

    await triggerEvent(find(selectors.tooltip), 'mouseenter');

    assert
      .dom('[data-test-ak-tooltip-content]')
      .containsText('cross into native (C/C++) code');
  });

  test('hover without a server tooltip shows the generic explanation', async function (assert) {
    this.setProperties({
      verdict: ReachabilityVerdict.UNKNOWN,
      tooltip: null,
    });

    await render(TEMPLATE);

    await triggerEvent(find(selectors.tooltip), 'mouseenter');

    assert
      .dom('[data-test-ak-tooltip-content]')
      .hasText(t('sbomModule.reachability.explanation.inconclusive'));
  });
});
