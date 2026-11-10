import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import {
  render,
  click,
  fillIn,
  find,
  triggerEvent,
  waitUntil,
} from '@ember/test-helpers';
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
  sectionCard: (testId) =>
    `[data-test-securityAnalysisDetails-sectionCard='${testId}']`,
  sectionTitle: '[data-test-securityAnalysisDetails-sectionCard-title]',
  sectionDescription:
    '[data-test-securityAnalysisDetails-sectionCard-description]',
  sourceTypeInput:
    '[data-test-securityAnalysisDetails-validatedFindings-sourceTypeInput]',
  sourceSnippetInput:
    '[data-test-securityAnalysisDetails-validatedFindings-sourceSnippetInput]',
  conversionNote:
    '[data-test-securityAnalysisDetails-validatedFindings-conversionNote]',
  tooltipRoot: '[data-test-ak-tooltip-root]',
  tooltipContent: '[data-test-ak-tooltip-content]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings
  @analysis={{this.analysis}}
/>`;

const FALSE_POSITIVES_TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings
  @analysis={{this.analysis}}
  @showsFalsePositives={{true}}
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

      this.stubFinding = (...traits) => {
        const finding = this.server.create(
          'security/validated-finding',
          ...traits
        );

        this.server.get('/knoxiq/analyses/:analysisId/findings', () => ({
          count: 1,
          next: null,
          previous: null,
          results: [finding.toJSON()],
        }));

        return finding;
      };

      this.saveTooltipContent = async () => {
        await triggerEvent(
          find(selectors.saveBtn).closest(selectors.tooltipRoot),
          'mouseenter'
        );

        return find(selectors.tooltipContent);
      };

      this.missingFieldsMessage = (...fields) =>
        t('securityAnalysisDetails.validatedFindings.missingFields', {
          fields: fields
            .map((field) =>
              t(`securityAnalysisDetails.validatedFindings.field.${field}`)
            )
            .join(', '),
        });

      // Saving or deleting a finding re-reads the analysis, because both
      // move the AEIS rollup.
      this.analysisReads = 0;

      this.server.get('/hudson-api/analyses/:id', (schema, req) => {
        this.analysisReads = this.analysisReads + 1;

        return schema['security/analyses'].find(`${req.params.id}`)?.toJSON();
      });

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

    test('an analysis with no findings offers nothing to save or delete', async function (assert) {
      this.stubFindings(0);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).doesNotExist();

      await click(selectors.moreMenuBtn);

      assert.dom(selectors.menuItem('originalAnalysis')).exists();
      assert.dom(selectors.menuItem('deleteFinding')).doesNotExist();
      assert.dom(selectors.menuItem('deleteAllFindings')).doesNotExist();
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

    // ─── False positives ───────────────────────────────────────────────────

    test('the true positive section asks the endpoint for true positives', async function (assert) {
      const requestedValidity = [];

      this.server.get(
        '/knoxiq/analyses/:analysisId/findings',
        (schema, req) => {
          requestedValidity.push(req.queryParams.is_valid);

          return { count: 0, next: null, previous: null, results: [] };
        }
      );

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      // The endpoint returns true positives when the param is absent.
      assert.deepEqual(requestedValidity, [undefined]);
    });

    test('the false positive section asks the endpoint for false positives', async function (assert) {
      const requestedValidity = [];

      this.server.get(
        '/knoxiq/analyses/:analysisId/findings',
        (schema, req) => {
          requestedValidity.push(req.queryParams.is_valid);

          return { count: 0, next: null, previous: null, results: [] };
        }
      );

      await render(FALSE_POSITIVES_TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.deepEqual(requestedValidity, ['false']);
    });

    test('the true positive section names itself', async function (assert) {
      this.stubFindings(0);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      const card = find(selectors.sectionCard('validatedFindings'));

      assert
        .dom(selectors.sectionTitle, card)
        .hasText(t('securityAnalysisDetails.validatedFindings.title'));

      assert
        .dom(selectors.sectionDescription, card)
        .hasText(t('securityAnalysisDetails.validatedFindings.description'));

      assert
        .dom(selectors.emptyState)
        .hasText(t('securityAnalysisDetails.validatedFindings.emptyState'));
    });

    test('the false positive section names itself', async function (assert) {
      // Empty, so it only belongs on the page when every finding is one.
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: true });
      this.stubFindings(0);

      await render(FALSE_POSITIVES_TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      const card = find(selectors.sectionCard('falsePositives'));

      assert
        .dom(selectors.sectionTitle, card)
        .hasText(
          t('securityAnalysisDetails.validatedFindings.falsePositivesTitle')
        );

      assert
        .dom(selectors.sectionDescription, card)
        .hasText(
          t(
            'securityAnalysisDetails.validatedFindings.falsePositivesDescription'
          )
        );

      assert
        .dom(selectors.emptyState)
        .hasText(
          t('securityAnalysisDetails.validatedFindings.noFalsePositives')
        );
    });

    test('false positives show on a mixed analysis', async function (assert) {
      // is_knoxiq_all_fp cannot tell "none" from "some", so the section
      // decides from its own fetch.
      this.stubFindings(2);

      await render(FALSE_POSITIVES_TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.sectionCard('falsePositives')).exists();
      assert.dom(selectors.detail).exists();
    });

    test('an analysis with no false positives shows no such section', async function (assert) {
      this.stubFindings(0);

      await render(FALSE_POSITIVES_TEMPLATE);

      assert
        .dom(selectors.sectionCard('falsePositives'))
        .doesNotExist('an empty card would be noise on most analyses');
    });

    test('the true positive section shows even when empty', async function (assert) {
      this.stubFindings(0);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert
        .dom(selectors.sectionCard('validatedFindings'))
        .exists('it is where a finding is added');
    });

    // ─── True positive conversion note ─────────────────────────────────────

    test('an empty true positive section warns that filing reclassifies the analysis', async function (assert) {
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: true });
      this.stubFindings(0);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert
        .dom(selectors.conversionNote)
        .hasText(
          t(
            'securityAnalysisDetails.validatedFindings.truePositiveConversionNote'
          )
        );
    });

    test('the false positive section carries no such warning', async function (assert) {
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: true });
      this.stubFindings(0);

      await render(FALSE_POSITIVES_TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.conversionNote).doesNotExist();
    });

    test('an analysis that already has true positives carries no warning', async function (assert) {
      this.stubFindings(0);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert
        .dom(selectors.conversionNote)
        .doesNotExist(
          'nothing to reverse when the analysis is not all false positives'
        );
    });

    test('the warning goes once a true positive exists', async function (assert) {
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: true });
      this.stubFindings(1);

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.conversionNote).doesNotExist();
    });

    // ─── Source ────────────────────────────────────────────────────────────

    test('the source fields show what the finding was raised on', async function (assert) {
      const finding = this.stubFinding();

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.sourceTypeInput).hasValue(finding.title);
      assert.dom(selectors.sourceSnippetInput).hasValue(finding.description);
    });

    test('editing the source is kept on the finding', async function (assert) {
      this.stubFinding();

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      await fillIn(selectors.sourceTypeInput, 'AndroidManifest.xml');
      await fillIn(selectors.sourceSnippetInput, '<uses-permission />');

      assert.dom(selectors.sourceTypeInput).hasValue('AndroidManifest.xml');
      assert.dom(selectors.sourceSnippetInput).hasValue('<uses-permission />');
    });

    test('a source is never required to save', async function (assert) {
      this.stubFinding({ title: '', description: '' });

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    // ─── Required fields ───────────────────────────────────────────────────

    test('a complete finding can be saved', async function (assert) {
      this.stubFinding();

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    test('a finding missing its remediation steps cannot be saved', async function (assert) {
      this.stubFinding('withoutRemediationSteps');

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isDisabled();

      assert
        .dom(await this.saveTooltipContent())
        .hasText(this.missingFieldsMessage('remediationSteps'));
    });

    test('a finding missing its reproduction steps cannot be saved', async function (assert) {
      this.stubFinding('withoutReproductionSteps');

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isDisabled();

      assert
        .dom(await this.saveTooltipContent())
        .hasText(this.missingFieldsMessage('stepsToReproduce'));
    });

    test('a finding missing its exploitability analysis cannot be saved', async function (assert) {
      this.stubFinding('withoutExploitabilityAnalysis');

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isDisabled();

      assert
        .dom(await this.saveTooltipContent())
        .hasText(this.missingFieldsMessage('exploitabilityAnalysis'));
    });

    test('the tooltip names every field still to fill in', async function (assert) {
      this.stubFinding(
        'withoutRemediationSteps',
        'withoutReproductionSteps',
        'withoutExploitabilityAnalysis'
      );

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert
        .dom(await this.saveTooltipContent())
        .hasText(
          this.missingFieldsMessage(
            'remediationSteps',
            'stepsToReproduce',
            'exploitabilityAnalysis'
          )
        );
    });

    test('blank step rows do not count as filled in', async function (assert) {
      this.stubFinding('withBlankSteps');

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isDisabled();

      assert
        .dom(await this.saveTooltipContent())
        .hasText(
          this.missingFieldsMessage('remediationSteps', 'stepsToReproduce')
        );
    });

    test('a step with only a heading counts as filled in', async function (assert) {
      this.stubFinding('withHeadingOnlyReproductionStep');

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    // ─── Required fields on an all false positive analysis ─────────────────

    test('an all false positive analysis does not ask for remediation, reproduction or exploitability', async function (assert) {
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: true });

      this.stubFinding(
        'withoutRemediationSteps',
        'withoutReproductionSteps',
        'withoutExploitabilityAnalysis'
      );

      await render(FALSE_POSITIVES_TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    test('an all false positive analysis still asks for the verdict fields', async function (assert) {
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: true });

      this.stubFinding({
        validation: {
          verdict: 'valid',
          is_valid: false,
          confidence: 0,
          confidence_label: 'UNKNOWN',
          finding_summary: '',
          evidence: [],
          reasoning: '',
          false_positive_indicators: [],
          is_third_party: false,
          library_origin: null,
        },
      });

      await render(FALSE_POSITIVES_TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isDisabled();

      assert
        .dom(await this.saveTooltipContent())
        .hasText(
          this.missingFieldsMessage('confidence', 'summary', 'reasoning')
        );
    });

    test('a true positive on an all false positive analysis is held to the same reduced set', async function (assert) {
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: true });

      this.stubFinding(
        'withoutRemediationSteps',
        'withoutReproductionSteps',
        'withoutExploitabilityAnalysis'
      );

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      assert.dom(selectors.saveBtn).isNotDisabled();
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

    test('deleting a finding re-reads the analysis', async function (assert) {
      this.stubFindings(2);

      this.server.delete(
        '/knoxiq/analyses/:analysisId/findings/:id',
        () => new Response(204)
      );

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      const readsBeforeDelete = this.analysisReads;

      await click(selectors.moreMenuBtn);
      await click(selectors.menuItemBtn('deleteFinding'));
      await click(selectors.confirmBtn);

      assert.strictEqual(this.analysisReads, readsBeforeDelete + 1);
    });

    test('deleting every finding re-reads the analysis once', async function (assert) {
      this.stubFindings(2);

      this.server.delete(
        '/knoxiq/analyses/:analysisId/findings/:id',
        () => new Response(204)
      );

      await render(TEMPLATE);
      await waitUntil(() => !find(selectors.loader), { timeout: 2000 });

      const readsBeforeDelete = this.analysisReads;

      await click(selectors.moreMenuBtn);
      await click(selectors.menuItemBtn('deleteAllFindings'));
      await click(selectors.confirmBtn);

      assert.strictEqual(
        this.analysisReads,
        readsBeforeDelete + 1,
        'the rollup is re-read after the whole batch, not per finding'
      );
    });
  }
);
