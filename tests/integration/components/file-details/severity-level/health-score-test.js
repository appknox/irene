import { click, find, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

// ─── Selectors ───
const selectors = {
  root: '[data-test-fileDetailSeverityLevel-healthScore]',
  title: '[data-test-fileDetailSeverityLevel-healthScore-title]',
  score: '[data-test-fileDetailSeverityLevel-healthScore-score]',
  maxScore: '[data-test-fileDetailSeverityLevel-healthScore-maxScore]',
  statusChip: '[data-test-fileDetailSeverityLevel-healthScore-statusChip]',
  scoringDetailsBtn:
    '[data-test-fileDetailSeverityLevel-healthScore-scoringDetails]',
  drawerTitle: '[data-test-healthScoreScoringDetails-title]',
  drawerCloseBtn: '[data-test-healthScoreScoringDetails-drawerCloseBtn]',
};

// ─── Template ───
const TEMPLATE = hbs`
  <FileDetails::SeverityLevel::HealthScore
    @file={{this.file}}
    @isCompact={{this.isCompact}}
  />
`;

// ─── Helpers ───
function setupHealthScoreEndpoint(server, currentScore, auditTrail = []) {
  server.get('/v3/files/:id/health_score_audit', () => ({
    current_score: currentScore,
    audit_trail: auditTrail,
  }));
}

module(
  'Integration | Component | file-details/severity-level/health-score',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');
      const profile = this.server.create('profile', { id: '100' });

      const project = this.server.create('project', {
        id: '1',
        activeProfileId: profile.id,
      });

      const file = this.server.create('file', {
        project: project.id,
        profile: profile.id,
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        store,
        isCompact: false,
      });
    });

    // ─── Empty state ────────────────────────────────────────────────────────────
    test('renders nothing when the API returns current_score null', async function (assert) {
      setupHealthScoreEndpoint(this.server, null);

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    // ─── Loading state ──────────────────────────────────────────────────────────
    test('shows skeleton while fetching and reveals score once loaded', async function (assert) {
      this.server.get(
        '/v3/files/:id/health_score_audit',
        () => ({
          current_score: {
            knoxiq_enabled: false,
            score: 73,
            score_type: 'severity_based',
            status: 'fair',
          },
          audit_trail: [],
        }),
        { timing: 300 }
      );

      render(TEMPLATE); // no await — inspect mid-flight state

      // Root appears immediately because isFetching = true → shouldShow = true
      await waitUntil(() => find(selectors.root), { timeout: 200 });

      // Score is not yet visible — skeletons are rendered instead
      assert.dom(selectors.score).doesNotExist();

      // Wait for fetch to complete and score to appear
      await waitUntil(() => find(selectors.score), { timeout: 2000 });

      assert.dom(selectors.score).hasText('73');
    });

    // ─── Detailed variant ───────────────────────────────────────────────────────
    test('detailed variant renders score, max-score, status chip and scoring-details button', async function (assert) {
      setupHealthScoreEndpoint(this.server, {
        knoxiq_enabled: false,
        score: 73,
        score_type: 'severity_based',
        status: 'fair',
      });

      await render(TEMPLATE);

      assert.dom(selectors.score).hasText('73');
      assert.dom(selectors.maxScore).hasText('/100');
      assert.dom(selectors.statusChip).hasText('Fair');
      assert.dom(selectors.scoringDetailsBtn).containsText(t('scoringDetails'));
    });

    // ─── Compact variant ────────────────────────────────────────────────────────
    test('compact variant renders section title above the score box', async function (assert) {
      setupHealthScoreEndpoint(this.server, {
        knoxiq_enabled: false,
        score: 60,
        score_type: 'severity_based',
        status: 'good',
      });

      this.set('isCompact', true);

      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('securityHealthScore'));
      assert.dom(selectors.score).hasText('60');
      assert.dom(selectors.maxScore).hasText('/100');
      assert.dom(selectors.statusChip).hasText('Good');
      assert.dom(selectors.scoringDetailsBtn).containsText(t('scoringDetails'));
    });

    // ─── Status chip label per status ───────────────────────────────────────────
    test.each(
      'status chip label is humanized from the raw status value',
      [
        ['very_poor', 'Very Poor'],
        ['poor', 'Poor'],
        ['fair', 'Fair'],
        ['good', 'Good'],
        ['excellent', 'Excellent'],
      ],
      async function (assert, [status, expectedLabel]) {
        setupHealthScoreEndpoint(this.server, {
          knoxiq_enabled: false,
          score: 50,
          score_type: 'severity_based',
          status,
        });

        await render(TEMPLATE);

        assert.dom(selectors.statusChip).hasText(expectedLabel);
      }
    );

    // ─── Scoring details drawer ─────────────────────────────────────────────────
    test('clicking scoring details button opens the drawer', async function (assert) {
      setupHealthScoreEndpoint(this.server, {
        knoxiq_enabled: false,
        score: 73,
        score_type: 'severity_based',
        status: 'fair',
      });

      await render(TEMPLATE);

      assert.dom(selectors.drawerTitle).doesNotExist();

      await click(selectors.scoringDetailsBtn);

      assert.dom(selectors.drawerTitle).hasText(t('scoringAudit'));
    });

    test('clicking the drawer close button hides the drawer', async function (assert) {
      setupHealthScoreEndpoint(this.server, {
        knoxiq_enabled: false,
        score: 73,
        score_type: 'severity_based',
        status: 'fair',
      });

      await render(TEMPLATE);

      await click(selectors.scoringDetailsBtn);
      assert.dom(selectors.drawerTitle).exists();

      await click(selectors.drawerCloseBtn);
      assert.dom(selectors.drawerTitle).doesNotExist();
    });
  }
);
