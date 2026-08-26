import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { ReachabilityVerdict } from 'irene/utils/sbom-reachability';

// ─── Selectors ───
const selectors = {
  chip: '[data-test-sbomReachability-status]',
  empty: '[data-test-sbomReachability-empty]',
};

// ─── Template ───
const TEMPLATE = hbs`
  <Sbom::ReachabilityStatus
    @verdict={{this.verdict}}
    @compact={{this.compact}}
  />
`;

module('Integration | Component | sbom/reachability-status', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.setProperties({
      verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
      compact: false,
    });
  });

  test.each(
    'it renders the chip for each verdict',
    [
      [
        ReachabilityVerdict.CONFIRMED_REACHABLE,
        'sbomModule.reachability.pathFound',
      ],
      [
        ReachabilityVerdict.POTENTIALLY_REACHABLE,
        'sbomModule.reachability.potential',
      ],
      [
        ReachabilityVerdict.NO_PATH_FOUND,
        'sbomModule.reachability.noPathFound',
      ],
      [ReachabilityVerdict.UNKNOWN, 'unknown'],
      [ReachabilityVerdict.UNSUPPORTED, 'sbomModule.reachability.unsupported'],
    ],
    async function (assert, [verdict, labelKey]) {
      this.set('verdict', verdict);

      await render(TEMPLATE);

      assert.dom(selectors.chip).hasText(t(labelKey));
      assert.dom(selectors.empty).doesNotExist();
    }
  );

  test('compact mode hides unknown as a dash', async function (assert) {
    this.setProperties({
      verdict: ReachabilityVerdict.UNKNOWN,
      compact: true,
    });

    await render(TEMPLATE);

    assert.dom(selectors.chip).doesNotExist();
    assert.dom(selectors.empty).hasText('-');
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
});
