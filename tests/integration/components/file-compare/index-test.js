import { module, test } from 'qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  compareFiles,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

module('Integration | Component | file-compare', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // Store service
    const store = this.owner.lookup('service:store');

    // Profile Model
    this.server.create('profile');

    // Creates an analyses and maps a vulnerability to it
    const createAnalyses = (vulnerability) => {
      const analysis = this.server.create('analysis');

      const normalizedAnalysis = store.normalize('analysis', analysis.toJSON());

      const analysisModel = store.push(normalizedAnalysis);

      analysisModel.set('vulnerability', vulnerability);

      return analysisModel;
    };

    // File Analyses Models
    const project = this.server.create('project');
    const normalizedProject = store.normalize('project', project.toJSON());
    const projectRecord = store.push(normalizedProject);

    const vulnerabilities = Array(7)
      .fill(null)
      .map(() => {
        const vul = this.server.create('vulnerability');
        const vulnerability = store.createRecord('vulnerability', {
          ...vul.toJSON(),
        });

        return vulnerability;
      });

    const analysesSet1 = vulnerabilities.map(createAnalyses);
    const analysesSet2 = vulnerabilities.map(createAnalyses);

    // Creates seven files that will ultimately serve as both base and compare files
    const files = this.server.createList('file', 7);
    const fileModels = files.map((file) => {
      const normalizedFile = store.normalize('file', file.toJSON());

      const fileModel = store.push(normalizedFile);
      fileModel.set('project', projectRecord);

      return fileModel;
    });

    const file1 = fileModels[0];
    file1.set('analyses', analysesSet1);

    const file2 = fileModels[1];
    file2.set('analyses', analysesSet2);

    // Unknown Analysis Status
    const unknownAnalysisStatus = this.server.create(
      'unknown-analysis-status',
      { id: 1, status: true }
    );

    const normalizedUnknownAnalysisStatus = store.normalize(
      'unknown-analysis-status',
      unknownAnalysisStatus.toJSON()
    );
    const unknownAnalysisStatusModel = store.push(
      normalizedUnknownAnalysisStatus
    );

    this.setProperties({
      store,
      file1,
      file2,
      unknownAnalysisStatus: unknownAnalysisStatusModel,
    });

    // Common server mocks
    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });

    this.server.get('/projects/:id/files', (schema) => {
      return schema.files.all().models;
    });
  });

  test('it renders', async function (assert) {
    await render(
      hbs`<FileCompare
          @file1={{this.file1}}
          @file2={{this.file2}}
          @unknownAnalysisStatus={{this.unknownAnalysisStatus}}
        />`
    );

    assert.dom('[data-test-fileCompare-header]').exists();
    assert.dom('[data-test-fileCompare-breadcrumbContainer]').exists();

    assert
      .dom('[data-test-fileCompare-header-baseFileId]')
      .exists()
      .containsText(this.file1.id);

    assert
      .dom('[data-test-fileCompare-header-compareFileId]')
      .exists()
      .hasText(this.file2.id);

    assert.dom('[data-test-fileCompare-header-compareFileEditIcon]').exists();

    // assert
    //   .dom('[data-test-fileCompare-header-reportDownloadBtn]')
    //   .exists()
    //   .hasText(t('downloadReport'));

    assert
      .dom('[data-test-fileCompare-header-showFilesOverview-icon]')
      .exists();

    // Tabs test
    const comparisons = compareFileAnalyses(this.file1, this.file2);
    const fileCompareCategories = getFileComparisonCategories(comparisons);

    const tabs = [
      {
        id: 'new-issues',
        label: t('fileCompare.newIssues'),
        badgeCount: fileCompareCategories.newRisks.length,
      },
      {
        id: 'recurring-issues',
        label: t('fileCompare.recurringIssues'),
        badgeCount: fileCompareCategories.recurring.length,
      },
      {
        id: 'resolved-issues',
        label: t('fileCompare.resolvedIssues'),
        badgeCount: fileCompareCategories.resolved.length,
      },
      {
        id: 'untested-cases',
        label: t('untested'),
        badgeCount: fileCompareCategories.untested.length,
      },
    ];

    tabs.forEach((tab) => {
      assert
        .dom(`[data-test-file-compare-tabs='${tab.id}-tab']`)
        .exists()
        .containsText(tab.label)
        .containsText(tab.badgeCount);
    });
  });

  test('it hides untested tab if show untested cases is false', async function (assert) {
    // Unknown Analysis Status
    const unknownAnalysisStatus = this.server.create(
      'unknown-analysis-status',
      { id: 1, status: false }
    );

    const normalizedUnknownAnalysisStatus = this.store.normalize(
      'unknown-analysis-status',
      unknownAnalysisStatus.toJSON()
    );

    this.unknownAnalysisStatusModel = this.store.push(
      normalizedUnknownAnalysisStatus
    );

    await render(
      hbs`<FileCompare
          @file1={{this.file1}}
          @file2={{this.file2}}
          @unknownAnalysisStatus={{this.unknownAnalysisStatus}}
        />`
    );

    assert
      .dom(`[data-test-file-compare-tabs='untested-cases-tab']`)
      .doesNotExist();
  });

  test('it toggles file overview header on show more or show less icon click', async function (assert) {
    await render(
      hbs`<FileCompare
          @file1={{this.file1}}
          @file2={{this.file2}}
        />`
    );

    const fileOverviewsSelectors = [
      ['[data-test-fileCompareHeader-file1Overview]', this.file1],
      ['[data-test-fileCompareHeader-file2Overview]', this.file2],
    ];

    await click('[data-test-fileCompare-header-showFilesOverview-icon]');

    fileOverviewsSelectors.forEach(([selector, file]) => {
      assert
        .dom(selector)
        .exists()
        .containsText(file.name)
        .containsText(file.project.get('packageName'))
        .containsText(file.version)
        .containsText(file.versionCode);
    });

    await click('[data-test-fileCompare-header-showFilesOverview-icon]');

    fileOverviewsSelectors.forEach(([selector]) =>
      assert.dom(selector).doesNotExist()
    );
  });
});
