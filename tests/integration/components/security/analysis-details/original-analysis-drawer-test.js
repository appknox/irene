import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  drawer:
    '[data-test-securityAnalysisDetails-validatedFindings-originalAnalysisDrawer]',
  title:
    '[data-test-securityAnalysisDetails-validatedFindings-originalAnalysisDrawer-title]',
  closeBtn:
    '[data-test-securityAnalysisDetails-validatedFindings-originalAnalysisDrawer-closeBtn]',
  emptyState:
    '[data-test-securityAnalysisDetails-validatedFindings-originalAnalysisDrawer-emptyState]',
  finding:
    '[data-test-securityAnalysisDetails-validatedFindings-originalAnalysisDrawer-finding]',
  findingTitle: (index) =>
    `[data-test-securityAnalysisDetails-validatedFindings-originalAnalysisDrawer-findingTitle='${index}']`,
  findingDescription: (index) =>
    `[data-test-securityAnalysisDetails-validatedFindings-originalAnalysisDrawer-findingDescription='${index}']`,
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings::OriginalAnalysisDrawer
  @open={{this.open}}
  @findings={{this.findings}}
  @onClose={{this.onClose}}
/>`;

module(
  'Integration | Component | security/analysis-details/validated-findings/original-analysis-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        open: true,
        closed: false,
        onClose: () => {
          this.set('closed', true);
        },
        findings: [
          {
            title: 'Custom TrustManager in com.appknox.Unsafe$1',
            description: 'Insecure TrustManager that trusts all certificates',
          },
          {
            title: 'Custom HostnameVerifier in org.jsoup.HttpConnection$1',
            description: 'Naive hostname verification performed',
          },
        ],
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────

    test('it is not rendered while closed', async function (assert) {
      this.set('open', false);

      await render(TEMPLATE);

      assert.dom(selectors.drawer).doesNotExist();
    });

    test('it renders the title when open', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.title)
        .hasText(
          t('securityAnalysisDetails.validatedFindings.originalAnalysisTitle')
        );
    });

    test('it renders every original finding', async function (assert) {
      await render(TEMPLATE);

      const rows = findAll(selectors.finding);

      assert.strictEqual(rows.length, this.findings.length);

      this.findings.forEach((finding, index) => {
        assert.dom(selectors.findingTitle(index)).hasText(finding.title);

        assert
          .dom(selectors.findingDescription(index))
          .hasText(finding.description);
      });
    });

    // ─── Empty state ───────────────────────────────────────────────────────

    test.each(
      'it renders the empty state when there is nothing to show',
      [[[]], [undefined]],
      async function (assert, [findings]) {
        this.set('findings', findings);

        await render(TEMPLATE);

        assert
          .dom(selectors.emptyState)
          .hasText(
            t('securityAnalysisDetails.validatedFindings.originalAnalysisEmpty')
          );

        assert.dom(selectors.finding).doesNotExist();
      }
    );

    // ─── Close ─────────────────────────────────────────────────────────────

    test('closing calls back', async function (assert) {
      await render(TEMPLATE);

      assert.false(this.closed);

      await click(selectors.closeBtn);

      assert.true(this.closed);
    });
  }
);
