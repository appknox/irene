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
        is_latest: false,
        superseded_by_file: null,
        ended: false,
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

    test('know more reveals the baseline details and new findings when reopened', async function (assert) {
      this.info = {
        ...this.info,
        passed: false,
        new_findings: 1,
        new_finding_labels: ['Debuggable'],
        is_latest: true,
        superseded_by_file: 9,
        ended: true,
      };

      await render(TEMPLATE);

      assert
        .dom(sel('summary'))
        .hasText(t('ignoreIfUnchangedReopenedNote', { count: 1, fileId: 5 }));

      await click(sel('knowMoreBtn'));

      assert.dom(sel('knowMoreBtn')).hasText(t('showLess'));

      assert
        .dom(sel('details'))
        .containsText(t('ignoreIfUnchangedDecidedNote'))
        .containsText(
          t('ignoreIfUnchangedBaselineFile', { fileId: 5, version: 2 })
        );

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

      assert
        .dom(sel('latestChip'))
        .hasText(t('ignoreIfUnchangedLatestBaseline'));
      assert
        .dom(sel('supersededChip'))
        .hasText(t('ignoreIfUnchangedSupersededBy', { fileId: 9 }));
      assert.dom(sel('endedChip')).hasText(t('ignoreIfUnchangedEnded'));

      await click(sel('knowMoreBtn'));

      assert.dom(sel('details')).doesNotExist();
    });

    test('it hides new findings and chips when they do not apply', async function (assert) {
      await render(TEMPLATE);
      await click(sel('knowMoreBtn'));

      assert.dom(sel('newFindings')).doesNotExist();
      assert.dom(sel('latestChip')).doesNotExist();
      assert.dom(sel('supersededChip')).doesNotExist();
      assert.dom(sel('endedChip')).doesNotExist();
    });
  }
);
