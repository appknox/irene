import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

// ─── Selectors ───
const selectors = {
  title: '[data-test-healthScoreScoringDetails-title]',
  subtitle: '[data-test-healthScoreScoringDetails-subtitle]',
  score: '[data-test-healthScoreScoringDetails-score]',
  statusChip: '[data-test-healthScoreScoringDetails-statusChip]',
  summary: '[data-test-healthScoreScoringDetails-summary]',
  drawerCloseBtn: '[data-test-healthScoreScoringDetails-drawerCloseBtn]',
  timelineEntry: '[data-test-healthScoreScoringDetails-timelineEntry]',
  dateChip: '[data-test-healthScoreScoringDetails-dateChip]',
  entryTitle: '[data-test-healthScoreScoringDetails-entryTitle]',
  latestChip: '[data-test-healthScoreScoringDetails-latestChip]',
  aeisChip: '[data-test-healthScoreScoringDetails-aeisChip]',
  scoreChange: '[data-test-healthScoreScoringDetails-scoreChange]',
};

// ─── Template ───
const TEMPLATE = hbs`
  <FileDetails::SeverityLevel::HealthScore::ScoringDetailsDrawer
    @open={{true}}
    @onClose={{this.onClose}}
    @fileId={{this.fileId}}
    @currentScore={{this.currentScore}}
    @auditTrail={{this.auditTrail}}
  />
`;

module(
  'Integration | Component | file-details/severity-level/health-score/scoring-details-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        fileId: '10',
        currentScore: {
          knoxiq_enabled: false,
          score: 73,
          score_type: 'severity_based',
          status: 'fair',
        },
        auditTrail: [],
        onClose: () => {},
      });
    });

    // ─── Header ─────────────────────────────────────────────────────────────────
    test('renders the drawer title and the score summary', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('healthScore.scoringAudit'));
      assert.dom(selectors.score).hasText('73');
      assert
        .dom(selectors.statusChip)
        .hasText(t('healthScore.scoringMethodology.ratingFair'));
      assert.dom(selectors.summary).hasText(t('healthScore.summary'));
    });

    test('subtitle shows file ID and mode when fileId is provided', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.subtitle).hasText(
        t('healthScore.scoringAuditSubtitle', {
          fileId: '10',
          mode: t('healthScore.standardScoring'),
        })
      );
    });

    test('subtitle is absent when fileId is not provided', async function (assert) {
      this.set('fileId', undefined);

      await render(TEMPLATE);

      assert.dom(selectors.subtitle).doesNotExist();
    });

    // ─── Timeline base entry ─────────────────────────────────────────────────────
    test('timeline always starts with a base entry at Starting point', async function (assert) {
      const record = this.server.create('file-health-score-audit');

      this.set('auditTrail', [record.audit_trail[0]]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);

      // base entry + 1 audit entry
      assert.strictEqual(entries.length, 2);

      assert
        .dom(selectors.dateChip, entries[0])
        .hasText(t('healthScore.startingPoint'));

      assert
        .dom(selectors.entryTitle, entries[0])
        .hasText(t('healthScore.baseScore'));

      assert.dom(selectors.scoreChange, entries[0]).hasText('+100');
    });

    // ─── Latest chip ─────────────────────────────────────────────────────────────
    test('Latest chip appears only on the last audit trail entry', async function (assert) {
      const record = this.server.create('file-health-score-audit');

      this.set('auditTrail', record.audit_trail);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);

      // entries[0] = base, entries[1] = first audit, entries[2] = last audit
      assert.dom(selectors.latestChip, entries[0]).doesNotExist();
      assert.dom(selectors.latestChip, entries[1]).doesNotExist();
      assert
        .dom(selectors.latestChip, entries[2])
        .hasText(t('healthScore.latest'));
    });

    // ─── KnoxIQ / AEIS chip ──────────────────────────────────────────────────────
    test('AEIS chip and KnoxIQ title appear when knoxiq_ran is true', async function (assert) {
      const record = this.server.create('file-health-score-audit');

      this.set('auditTrail', [
        { ...record.audit_trail[1], event_type: 'sast_completed' },
      ]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);
      const auditEntry = entries[1];

      assert
        .dom(selectors.aeisChip, auditEntry)
        .hasText(t('healthScore.aeisApplied'));

      assert
        .dom(selectors.entryTitle, auditEntry)
        .hasText(t('healthScore.knoxiqOnScan', { scanType: t('sast') }));
    });

    test('AEIS chip and KnoxIQ title are absent when knoxiq_ran is false', async function (assert) {
      const record = this.server.create('file-health-score-audit');

      this.set('auditTrail', [
        { ...record.audit_trail[0], event_type: 'sast_completed' },
      ]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);
      const auditEntry = entries[1];

      assert.dom(selectors.aeisChip, auditEntry).doesNotExist();
      assert
        .dom(selectors.entryTitle, auditEntry)
        .hasText(t('healthScore.sastRunTitle'));
    });

    // ─── Run numbering ────────────────────────────────────────────────────────────
    test('multiple runs of the same scan type are numbered sequentially', async function (assert) {
      const record = this.server.create('file-health-score-audit');

      this.set('auditTrail', [
        { ...record.audit_trail[0], event_type: 'dast_completed' },
        {
          ...record.audit_trail[0],
          event_type: 'dast_completed',
          previous_score: 75,
          score: 80,
        },
      ]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);

      assert
        .dom(selectors.entryTitle, entries[1])
        .hasText(t('healthScore.dastRunTitle', { run: 1 }));

      assert
        .dom(selectors.entryTitle, entries[2])
        .hasText(t('healthScore.dastRunTitle', { run: 2 }));
    });

    test('a single run of each scan type shows no run number', async function (assert) {
      const record = this.server.create('file-health-score-audit');

      this.set('auditTrail', [
        { ...record.audit_trail[0], event_type: 'sast_completed' },
        {
          ...record.audit_trail[0],
          event_type: 'dast_completed',
          previous_score: 75,
          score: 60,
        },
      ]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);

      assert
        .dom(selectors.entryTitle, entries[1])
        .hasText(t('healthScore.sastRunTitle'));
      assert.dom(selectors.entryTitle, entries[2]).hasText(t('dastTitle'));
    });

    // ─── Score change ─────────────────────────────────────────────────────────────
    test.each(
      'score change text reflects the delta between previous and current score',
      [
        [{ previous_score: 50, score: 75 }, '+25'],
        [{ previous_score: 100, score: 75 }, '-25'],
        [{ previous_score: 75, score: 75 }, '0'],
      ],
      async function (assert, [scoreAttrs, expectedChange]) {
        const record = this.server.create('file-health-score-audit');

        this.set('auditTrail', [{ ...record.audit_trail[0], ...scoreAttrs }]);

        await render(TEMPLATE);

        const entries = findAll(selectors.timelineEntry);

        assert.dom(selectors.scoreChange, entries[1]).hasText(expectedChange);
      }
    );

    // ─── Close button ─────────────────────────────────────────────────────────────
    test('clicking the close button fires the onClose callback', async function (assert) {
      let onCloseCalled = false;

      this.set('onClose', () => {
        onCloseCalled = true;
      });

      await render(TEMPLATE);

      assert.false(onCloseCalled, 'onClose not called before interaction');

      await click(selectors.drawerCloseBtn);

      assert.true(onCloseCalled, 'onClose was called after clicking close');
    });
  }
);
