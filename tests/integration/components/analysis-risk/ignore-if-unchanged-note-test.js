import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dayjs from 'dayjs';

const sel = (name) => `[data-test-analysisRisk-ignoreIfUnchangedNote-${name}]`;

module(
  'Integration | Component | analysis-risk/ignore-if-unchanged-note',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.info = {
        baseline_file: 5,
        version: 2,
        new_findings: 0,
        passed: true,
        pending: false,
        waiting_for: [],
        is_baseline_file: false,
        baseline_versions: [],
        baseline_findings: ['Insecure storage', 'Weak crypto'],
        new_finding_labels: [],
        comment: 'known and accepted',
        created_by: 'qa@appknox.com',
        created_on: '2026-10-20T10:00:00Z',
      };
    });

    const TEMPLATE = hbs`<AnalysisRisk::IgnoreIfUnchangedNote @info={{this.info}} />`;

    test('it shows one line and keeps details collapsed by default', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(sel('summary'))
        .hasText(t('ignoreIfUnchangedIgnoredHint', { fileId: 5 }));

      assert.dom(sel('knowMoreBtn')).hasText(t('knowMore'));
      assert.dom(sel('details')).doesNotExist();
    });

    test('it shows the baseline file line with the saved findings count', async function (assert) {
      this.info.is_baseline_file = true;

      await render(TEMPLATE);

      assert
        .dom(sel('summary'))
        .hasText(t('ignoreIfUnchangedBaselineNote', { count: 2 }));
    });

    test('it shows the pending line joined with "and"', async function (assert) {
      this.info = {
        ...this.info,
        passed: false,
        pending: true,
        waiting_for: ['static', 'dynamic'],
      };

      await render(TEMPLATE);

      assert.dom(sel('summary')).hasText(
        t('ignoreIfUnchangedPendingNote', {
          scans: 'static and dynamic',
          fileId: 5,
        })
      );
    });

    test('know more shows one card for the baseline a compared file used', async function (assert) {
      this.info = {
        ...this.info,
        passed: false,
        new_findings: 1,
        new_finding_labels: ['Debuggable'],
      };

      await render(TEMPLATE);

      assert
        .dom(sel('summary'))
        .hasText(t('ignoreIfUnchangedReopenedNote', { count: 1, fileId: 5 }));

      await click(sel('knowMoreBtn'));

      assert.dom(sel('knowMoreBtn')).hasText(t('showLess'));
      assert.dom(sel('card')).exists({ count: 1 });

      assert
        .dom(sel('baseline'))
        .hasText(t('ignoreIfUnchangedBaselineFile', { fileId: 5, version: 2 }));

      assert.dom(sel('createdBy')).hasText(
        t('ignoreIfUnchangedCreatedBy', {
          user: 'qa@appknox.com',
          date: dayjs('2026-10-20T10:00:00Z').format('MMM DD, YYYY'),
        })
      );

      assert.dom(sel('comment')).containsText('known and accepted');
      assert.dom(`${sel('baselineFindings')} li`).exists({ count: 2 });

      assert
        .dom(`${sel('newFindings')} li`)
        .exists({ count: 1 })
        .hasText('Debuggable');

      // compared files carry no baseline chips
      assert.dom(sel('latestChip')).doesNotExist();
      assert.dom(sel('pastChip')).doesNotExist();

      await click(sel('knowMoreBtn'));

      assert.dom(sel('details')).doesNotExist();
    });

    test('a passed file shows its card without new findings', async function (assert) {
      await render(TEMPLATE);
      await click(sel('knowMoreBtn'));

      assert.dom(sel('card')).exists({ count: 1 });
      assert.dom(sel('newFindings')).doesNotExist();
    });

    test('a pending file says it will be compared with the baseline', async function (assert) {
      this.info = {
        ...this.info,
        passed: false,
        pending: true,
        waiting_for: ['dynamic'],
      };

      await render(TEMPLATE);
      await click(sel('knowMoreBtn'));

      assert
        .dom(sel('baseline'))
        .hasText(
          t('ignoreIfUnchangedWillCompareWith', { fileId: 5, version: 2 })
        );
    });

    test('the baseline file shows one card per version with latest and past chips', async function (assert) {
      const version = (n, latest, findings) => ({
        version: n,
        baseline_file: 1,
        created_by: 'qa@appknox.com',
        created_on: `2026-10-${28 + n}T10:00:00Z`,
        comment: `Accepted on File ID: 1 (v${n})`,
        findings,
        is_latest: latest,
      });

      this.info = {
        ...this.info,
        baseline_file: 1,
        version: 2,
        is_baseline_file: true,
        baseline_versions: [
          version(2, true, ['Insecure storage', 'Weak crypto']),
          version(1, false, ['Insecure storage']),
        ],
      };

      await render(TEMPLATE);
      await click(sel('knowMoreBtn'));

      assert.dom(sel('card')).exists({ count: 2 });

      const titles = [...document.querySelectorAll(sel('baseline'))].map((el) =>
        el.textContent.trim()
      );

      assert.deepEqual(titles, [
        t('ignoreIfUnchangedBaselineFile', { fileId: 1, version: 2 }),
        t('ignoreIfUnchangedBaselineFile', { fileId: 1, version: 1 }),
      ]);

      assert
        .dom(sel('latestChip'))
        .exists({ count: 1 })
        .hasText(t('ignoreIfUnchangedLatestBaseline'));

      assert
        .dom(sel('pastChip'))
        .exists({ count: 1 })
        .hasText(t('ignoreIfUnchangedPastBaseline'));

      const findingCounts = [
        ...document.querySelectorAll(sel('baselineFindings')),
      ].map((el) => el.querySelectorAll('li').length);

      assert.deepEqual(findingCounts, [2, 1]);
    });
  }
);
