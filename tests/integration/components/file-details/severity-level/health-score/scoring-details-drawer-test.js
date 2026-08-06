import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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

// ─── Helpers ───
const buildAuditEntry = (overrides = {}) => ({
  id: 1,
  score: 75,
  previous_score: 100,
  score_change: -25,
  score_type: 'severity_based',
  status: 'fair',
  trend: 'declined',
  event_type: 'sast_completed',
  event_description: '5 vulnerabilities found.',
  calculated_at: '2026-06-24T09:00:00.000Z',
  coverage_ceiling: 0,
  coverage_level: 'NONE',
  completed_scans: ['sast'],
  pending_scans: ['dast', 'api', 'manual'],
  critical_count: 2,
  high_count: 3,
  medium_count: 0,
  low_count: 0,
  ignored_count: 0,
  critical_risk: 50,
  high_risk: 30,
  medium_risk: 0,
  low_risk: 0,
  accepted_risk_cap: null,
  knoxiq_enabled: false,
  knoxiq_ran: false,
  severity_overrides_count: 0,
  ...overrides,
});

module(
  'Integration | Component | file-details/severity-level/health-score/scoring-details-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
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

      assert.dom(selectors.title).hasText(t('scoringAudit'));
      assert.dom(selectors.score).hasText('73');
      assert.dom(selectors.statusChip).hasText('Fair');
      assert.dom(selectors.summary).hasText(t('healthScoreSummary'));
    });

    test('subtitle shows file ID and mode when fileId is provided', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.subtitle).hasText(
        t('scoringAuditSubtitle', {
          fileId: '10',
          mode: t('standardScoring'),
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
      this.set('auditTrail', [buildAuditEntry()]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);

      // base entry + 1 audit entry
      assert.strictEqual(entries.length, 2);

      assert.dom(selectors.dateChip, entries[0]).hasText(t('startingPoint'));

      assert.dom(selectors.entryTitle, entries[0]).hasText(t('baseScore'));

      assert.dom(selectors.scoreChange, entries[0]).hasText('+100');
    });

    // ─── Latest chip ─────────────────────────────────────────────────────────────
    test('Latest chip appears only on the last audit trail entry', async function (assert) {
      this.set('auditTrail', [
        buildAuditEntry({ id: 1 }),
        buildAuditEntry({ id: 2 }),
      ]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);

      // entries[0] = base, entries[1] = first audit, entries[2] = last audit
      assert.dom(selectors.latestChip, entries[0]).doesNotExist();
      assert.dom(selectors.latestChip, entries[1]).doesNotExist();
      assert.dom(selectors.latestChip, entries[2]).hasText(t('latest'));
    });

    // ─── KnoxIQ / AEIS chip ──────────────────────────────────────────────────────
    test('AEIS chip and KnoxIQ title appear when knoxiq_ran is true', async function (assert) {
      this.set('auditTrail', [
        buildAuditEntry({
          id: 1,
          event_type: 'sast_completed',
          knoxiq_ran: true,
        }),
      ]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);
      const auditEntry = entries[1];

      assert.dom(selectors.aeisChip, auditEntry).hasText(t('aeisApplied'));

      assert
        .dom(selectors.entryTitle, auditEntry)
        .hasText(t('knoxiqOnScan', { scanType: 'SAST' }));
    });

    test('AEIS chip and KnoxIQ title are absent when knoxiq_ran is false', async function (assert) {
      this.set('auditTrail', [
        buildAuditEntry({
          id: 1,
          event_type: 'sast_completed',
          knoxiq_ran: false,
        }),
      ]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);
      const auditEntry = entries[1];

      assert.dom(selectors.aeisChip, auditEntry).doesNotExist();
      assert.dom(selectors.entryTitle, auditEntry).hasText('SAST Scan');
    });

    // ─── Run numbering ────────────────────────────────────────────────────────────
    test('multiple runs of the same scan type are numbered sequentially', async function (assert) {
      this.set('auditTrail', [
        buildAuditEntry({ id: 1, event_type: 'dast_completed' }),
        buildAuditEntry({
          id: 2,
          event_type: 'dast_completed',
          previous_score: 75,
          score: 80,
        }),
      ]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);

      assert
        .dom(selectors.entryTitle, entries[1])
        .hasText(t('dastRunTitle', { run: 1 }));

      assert
        .dom(selectors.entryTitle, entries[2])
        .hasText(t('dastRunTitle', { run: 2 }));
    });

    test('a single run of each scan type shows no run number', async function (assert) {
      this.set('auditTrail', [
        buildAuditEntry({ id: 1, event_type: 'sast_completed' }),
        buildAuditEntry({
          id: 2,
          event_type: 'dast_completed',
          previous_score: 75,
          score: 60,
        }),
      ]);

      await render(TEMPLATE);

      const entries = findAll(selectors.timelineEntry);

      assert.dom(selectors.entryTitle, entries[1]).hasText('SAST Scan');
      assert.dom(selectors.entryTitle, entries[2]).hasText('DAST Scan');
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
        this.set('auditTrail', [buildAuditEntry({ id: 1, ...scoreAttrs })]);

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
