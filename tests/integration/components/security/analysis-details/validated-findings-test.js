import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, click, find, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {} // NOSONAR
}

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  loader: '[data-test-securityAnalysisDetails-validatedFindings-loader]',
  emptyState:
    '[data-test-securityAnalysisDetails-validatedFindings-emptyState]',
  detail: '[data-test-securityAnalysisDetails-validatedFindings-detail]',
  addFindingBtn:
    '[data-test-securityAnalysisDetails-validatedFindings-addFindingBtn]',
  saveBtn: '[data-test-securityAnalysisDetails-validatedFindings-saveBtn]',
  moreMenuBtn:
    '[data-test-securityAnalysisDetails-validatedFindings-moreMenuBtn]',
  actionsDivider:
    '[data-test-securityAnalysisDetails-validatedFindings-actionsDivider]',
  menuItem: (id) =>
    `[data-test-securityAnalysisDetails-validatedFindings-moreMenuItem='${id}']`,
  // ...attributes lands on the li; the click and disabled state are on the
  // button inside it.
  menuItemBtn: (id) =>
    `[data-test-securityAnalysisDetails-validatedFindings-moreMenuItem='${id}'] button`,
  drawer:
    '[data-test-securityAnalysisDetails-validatedFindings-originalAnalysisDrawer]',
  confirmBtn: '[data-test-confirmbox-confirmBtn]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings
  @analysis={{this.analysis}}
/>`;

module(
  'Integration | Component | security/analysis-details/validated-findings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);

      this.store = this.owner.lookup('service:store');
      this.notify = this.owner.lookup('service:notifications');

      this.pushAnalysis = (attrs = {}) => {
        const record = this.server.create('security/analysis', attrs);

        return this.store.push(
          this.store.normalize('security/analysis', record.toJSON())
        );
      };

      this.stubFindings = (count) => {
        const findings = this.server.createList(
          'security/validated-finding',
          count
        );

        this.server.get('/knoxiq/analyses/:analysisId/findings', () => ({
          count: findings.length,
          next: null,
          previous: null,
          results: findings.map((finding) => finding.toJSON()),
        }));

        return findings;
      };

      this.setProperties({});

      this.analysis = this.pushAnalysis({ risk: ENUMS.RISK.HIGH });
    });

    // ─── Marked as passed ──────────────────────────────────────────────────

    test('a passed analysis still shows the editor', async function (assert) {
      this.analysis = this.pushAnalysis({ risk: ENUMS.RISK.NONE });
      this.stubFindings(2);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.detail).exists('findings stay editable once passed');
      assert.dom(selectors.addFindingBtn).isNotDisabled();
    });

    test('a passed analysis with no findings shows the empty state', async function (assert) {
      this.analysis = this.pushAnalysis({ risk: ENUMS.RISK.NONE });
      this.stubFindings(0);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert
        .dom(selectors.emptyState)
        .hasText(t('securityAnalysisDetails.validatedFindings.emptyState'));
    });

    test('an unpassed analysis shows the editor', async function (assert) {
      this.stubFindings(2);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.detail).exists();
    });

    // ─── Empty state ───────────────────────────────────────────────────────

    test('an analysis with no findings shows the empty state', async function (assert) {
      this.stubFindings(0);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert
        .dom(selectors.emptyState)
        .hasText(t('securityAnalysisDetails.validatedFindings.emptyState'));

      assert.dom(selectors.detail).doesNotExist();
      assert.dom(selectors.actionsDivider).doesNotExist();
    });

    // ─── Loading ───────────────────────────────────────────────────────────

    test('the loader appears while findings load and then disappears', async function (assert) {
      this.stubFindings(1);

      render(TEMPLATE);

      await waitUntil(() => find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.loader).exists();

      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.loader).doesNotExist();
      assert.dom(selectors.detail).exists();
    });

    // ─── More menu ─────────────────────────────────────────────────────────

    test('the menu lists every action', async function (assert) {
      this.stubFindings(2);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });
      await click(selectors.moreMenuBtn);

      assert
        .dom(selectors.menuItem('originalAnalysis'))
        .hasText(
          t('securityAnalysisDetails.validatedFindings.originalAnalysis')
        );

      assert
        .dom(selectors.menuItem('deleteFinding'))
        .hasText(
          t('securityAnalysisDetails.validatedFindings.deleteThisFinding')
        );

      assert
        .dom(selectors.menuItem('deleteAllFindings'))
        .hasText(
          t('securityAnalysisDetails.validatedFindings.deleteOverallFinding')
        );
    });

    test('the delete actions stay available for the last finding', async function (assert) {
      this.stubFindings(1);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });
      await click(selectors.moreMenuBtn);

      assert.dom(selectors.menuItemBtn('deleteFinding')).isNotDisabled();
      assert.dom(selectors.menuItemBtn('deleteAllFindings')).isNotDisabled();
    });

    // ─── Reporting upward ──────────────────────────────────────────────────

    // ─── Adding ────────────────────────────────────────────────────────────

    test('adding a finding opens an editor without sending it', async function (assert) {
      this.stubFindings(1);

      let posted = false;

      this.server.post('/knoxiq/analyses/:analysisId/findings', () => {
        posted = true;

        return this.server.create('security/validated-finding').toJSON();
      });

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      await click(selectors.addFindingBtn);

      assert.false(posted, 'an incomplete finding is not sent');

      // Nothing has been filled in, so there is nothing worth saving yet.
      assert.dom(selectors.saveBtn).isDisabled();
    });

    // ─── Deleting ──────────────────────────────────────────────────────────

    test('deleting a finding removes it', async function (assert) {
      const findings = this.stubFindings(2);

      this.server.delete('/knoxiq/analyses/:analysisId/findings/:id', () => {
        this.deletedId = true;

        return new Response(204);
      });

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.strictEqual(findings.length, 2);

      await click(selectors.moreMenuBtn);
      await click(selectors.menuItemBtn('deleteFinding'));
      await click(selectors.confirmBtn);

      assert.true(this.deletedId);
    });
  }
);
