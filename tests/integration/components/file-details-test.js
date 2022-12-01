import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import faker from 'faker';
import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

module('Integration | Component | file-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');
    this.profile = this.store.createRecord('profile', { id: 1 });
    this.project = this.store.createRecord('project', {
      id: 1,
      isManualScanAvailable: true,
    });

    this.server.get('v2/files/:id/reports', () => {
      return [];
    });

    this.server.get('/profiles/:id/proxy_settings', (schema, req) => {
      return {
        id: req.params.id,
        host: '',
        port: '',
        enabled: false,
      };
    });

    this.server.get('/profiles/:id/unknown_analysis_status', () => {
      return {
        id: 1,
        status: true,
      };
    });

    this.server.get('v2/files/:id', () => {
      return {
        id: 1,
      };
    });

    this.server.get('/manualscans/:id', () => {
      return {
        id: 1,
        status: true,
      };
    });
  });

  test('it renders correctly', async function (assert) {
    assert.expect(17);

    this.file = this.store.createRecord('file', {
      id: 1,
      profile: this.profile,
      project: this.project,
    });

    this.server.get('/hudson-api/projects', () => {
      return [];
    });

    await render(hbs`<FileDetails @file={{this.file}} />`);
    assert.dom('[data-test="file-header"]').exists();
    assert.dom('[data-test-edit-analyses-link-wrapper]').exists();
    assert.dom('[data-test-edit-analyses-link]').exists();
    assert.ok(
      this.element
        .querySelector('[data-test-edit-analyses-link]')
        .href.includes(`/security/file/${this.file.id}`)
    );
    assert
      .dom('[data-test-sort-analyses-by-impact]')
      .exists()
      .hasAnyText('t:impact:()');
    assert.dom('[data-test-vulnerability-details-header]').exists();
    assert.dom('[data-test-vulnerability-filter]').exists();
    assert.dom('[data-test-vulnerability-filter-select]').exists();

    const vulnerabilityTypes = ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1);
    const vulnerabilitySelectOptions = this.element.querySelectorAll(
      '[data-test-vulnerability-filter-select-option]'
    );

    // The first select option is not part of the vulnerabilityTypes list
    // It has a value of -1

    assert.strictEqual(
      vulnerabilitySelectOptions.length,
      vulnerabilityTypes.length + 1
    );

    assert.strictEqual(vulnerabilitySelectOptions[0].value, '-1');
    assert.ok(
      vulnerabilitySelectOptions[0].innerText.includes('t:allScans:()')
    );
    assert.dom('[data-test-no-analyses-found]').exists();

    for (const type of vulnerabilityTypes) {
      assert.strictEqual(
        vulnerabilitySelectOptions[type.value].value,
        `${type.value}`
      );
    }
  });

  test('it hides edit analyses button when hudson projects api returns a 403 i.e a user is unauthorized', async function (assert) {
    this.file = this.store.createRecord('file', {
      id: 1,
      profile: this.profile,
      project: this.project,
    });

    this.server.get('/hudson-api/projects', () => {
      return Response(403);
    });

    await render(hbs`<FileDetails @file={{this.file}} />`);
    assert.dom('[data-test-edit-analyses-link-wrapper]').doesNotExist();
    assert.dom('[data-test-edit-analyses-link]').doesNotExist();
  });

  test('it should remove manual option scan from vulnerability select if manual scan is disabled', async function (assert) {
    this.project = this.store.createRecord('project', {
      id: 2,
      isManualScanAvailable: false,
    });

    this.file = this.store.createRecord('file', {
      id: 2,
      profile: this.profile,
      project: this.project,
    });

    this.server.get('/hudson-api/projects', () => {
      return Response(403);
    });

    await render(hbs`<FileDetails @file={{this.file}} />`);

    assert.dom('[data-test-vulnerability-filter-select]').exists();
    const vulnerabilitySelectOptions = this.element.querySelectorAll(
      '[data-test-vulnerability-filter-select-option]'
    );
    const optionsList = [...vulnerabilitySelectOptions];
    const manualScanType = ENUMS.VULNERABILITY_TYPE.MANUAL;

    assert.ok(
      optionsList.every((option) => Number(option.value) !== manualScanType),
      'Manual scan select option does not exist in vulnerability select options'
    );
  });

  test('it renders analyses list sorted according to computedRisk value', async function (assert) {
    assert.expect(13);

    this.project = this.store.createRecord('project', {
      id: 2,
      isManualScanAvailable: false,
    });

    this.analyses = [];

    for (let i of [1, 2, 3, 4]) {
      const vulnerability = this.store.createRecord('vulnerability', {
        id: i,
        name: faker.lorem.words(2),
        types: [i],
      });

      const analyses = this.store.createRecord('analysis', {
        id: i,
        status: ENUMS.ANALYSIS.COMPLETED,
        createdOn: faker.date.past(),
        updatedOn: faker.date.past(),
        risk: faker.random.arrayElement(ENUMS.RISK.VALUES),
        computedRisk: i,
        vulnerability: vulnerability,
      });

      this.analyses.push(analyses);
    }

    this.set(
      'file',
      this.store.createRecord('file', {
        id: 2,
        profile: this.profile,
        project: this.project,
        analyses: this.analyses,
        isApiDone: false,
        isStaticDone: true,
        isManualDone: true,
        isDynamicDone: true,
      })
    );

    this.server.get('/hudson-api/projects', () => {
      return Response(403);
    });

    await render(hbs`<FileDetails @file={{this.file}} />`);

    assert.dom('[data-test-no-analyses-found]').doesNotExist();

    for (const analysis of this.analyses) {
      assert.dom(`[data-test-analysis-id="${analysis.id}"]`).exists();
      assert
        .dom(
          `[data-test-analysis-risk-tag-label="${
            analysisRiskStatus([
              analysis.computedRisk,
              analysis.status,
              analysis.isOverriddenRisk,
            ]).label
          }"]`
        )
        .exists();
    }

    const allAnalysisDetailsElement = findAll(
      '[data-test-analysis-details-container]'
    );

    for (let i = 0; i < allAnalysisDetailsElement.length; i++) {
      const renderedAnalysisDetailsElement = allAnalysisDetailsElement[i];

      const expectedRenderedAnalysis =
        this.analyses[this.analyses.length - i - 1];
      const expectedRiskStatus = analysisRiskStatus([
        expectedRenderedAnalysis.computedRisk,
        expectedRenderedAnalysis.status,
        expectedRenderedAnalysis.isOverriddenRisk,
      ]).label.toLowerCase();

      assert.ok(
        renderedAnalysisDetailsElement
          .querySelector('[data-test-analysis-risk-tag]')
          ?.innerText.toLowerCase()
          .includes(expectedRiskStatus),
        `Rendered Analysis Element #${
          i + 1
        } has risk status of ${expectedRiskStatus}`
      );
    }
  });

  test('it sorts the analyses list properly when the computedRisk value of an analysis changes', async function (assert) {
    assert.expect(5);

    this.analyses = [];

    for (let i of [1, 2, 3, 4]) {
      const vulnerability = this.store.createRecord('vulnerability', {
        id: i,
        name: faker.lorem.words(2),
        types: [1],
      });

      const analyses = this.store.createRecord('analysis', {
        id: i,
        status: ENUMS.ANALYSIS.COMPLETED,
        createdOn: faker.date.past(),
        updatedOn: faker.date.past(),
        risk: faker.random.arrayElement(ENUMS.RISK.VALUES),
        computedRisk: 1,
        vulnerability: vulnerability,
      });

      this.analyses.push(analyses);
    }

    this.set(
      'file',
      this.store.createRecord('file', {
        id: 2,
        profile: this.profile,
        project: this.project,
        analyses: this.analyses,
        isApiDone: false,
        isStaticDone: true,
        isManualDone: true,
        isDynamicDone: true,
      })
    );

    this.server.get('/hudson-api/projects', () => {
      return Response(403);
    });

    await render(hbs`<FileDetails @file={{this.file}} />`);

    const allAnalysisDetailsElement = findAll(
      '[data-test-analysis-details-container]'
    );

    for (let i = 0; i < allAnalysisDetailsElement.length; i++) {
      const renderedAnalysisDetailsElement = allAnalysisDetailsElement[i];

      const expectedRenderedAnalysis =
        this.analyses[this.analyses.length - i - 1];
      const expectedRiskStatus = analysisRiskStatus([
        expectedRenderedAnalysis.computedRisk,
        expectedRenderedAnalysis.status,
        expectedRenderedAnalysis.isOverriddenRisk,
      ]).label.toLowerCase();

      assert.ok(
        renderedAnalysisDetailsElement
          .querySelector('[data-test-analysis-risk-tag]')
          ?.innerText.toLowerCase()
          .includes(expectedRiskStatus),
        `Rendered Analysis Element #${
          i + 1
        } has risk status of ${expectedRiskStatus}`
      );
    }

    // Change the computed risk of the third analysis
    const thirdAnalysesItem = this.analyses[2];
    thirdAnalysesItem.computedRisk = 4;
    const thirdItemRistStatus = analysisRiskStatus([
      thirdAnalysesItem.computedRisk,
      thirdAnalysesItem.status,
      thirdAnalysesItem.isOverriddenRisk,
    ]).label.toLowerCase();

    await render(hbs`<FileDetails @file={{this.file}} />`);

    const updatedAnalysisDetailsElements = findAll(
      '[data-test-analysis-details-container]'
    );

    // Check if risk status of first element
    // corresponds to the risk status of third item in the analysis list

    assert.ok(
      updatedAnalysisDetailsElements[0]
        .querySelector('[data-test-analysis-risk-tag]')
        ?.innerText.toLowerCase()
        .includes(thirdItemRistStatus),
      `Rendered Analysis Element #${1} has changed to the third risk that has a status of ${thirdItemRistStatus}`
    );
  });
});
