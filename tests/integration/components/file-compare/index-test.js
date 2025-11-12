import { module, test } from 'qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import {
  compareFileAnalyses,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module('Integration | Component | file-compare', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    setupFileModelEndpoints(this.server);

    // Store service
    const store = this.owner.lookup('service:store');

    // Profile Model
    this.server.create('profile');

    // Creates an analyses and maps a vulnerability to it
    const createAnalyses = (file, vulnerability) => {
      const analysis = this.server.create('analysis', { file: file.id });
      const normalizedAnalysis = store.normalize('analysis', analysis.toJSON());
      const analysisModel = store.push(normalizedAnalysis);

      analysisModel.set('vulnerability', vulnerability);

      return analysisModel;
    };

    // File Analyses Models
    const project = this.server.create('project', {
      show_unknown_analysis: true,
    });

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

    // Creates seven files that will ultimately serve as both base and compare files
    const files = this.server.createList('file', 7);
    const fileModels = files.map((file) => {
      const normalizedFile = store.normalize('file', file.toJSON());

      const fileModel = store.push(normalizedFile);
      fileModel.set('project', projectRecord);

      return fileModel;
    });

    const file1 = fileModels[0];
    const file2 = fileModels[1];

    const analysesSet1 = vulnerabilities.map((vulnerability) =>
      createAnalyses(file1, vulnerability)
    );

    const analysesSet2 = vulnerabilities.map((vulnerability) =>
      createAnalyses(file2, vulnerability)
    );

    this.setProperties({
      store,
      file1,
      file2,
      analysesSet1,
      analysesSet2,
      project: projectRecord,
    });

    this.server.get('/v3/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });

    this.server.get('/v3/projects/:id/files', (schema) => {
      return schema.files.all().models;
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`
      <FileCompare
        @file1={{this.file1}}
        @file2={{this.file2}}
        @unknownAnalysisStatus={{this.project.showUnknownAnalysis}}
        @file1Analyses={{this.analysesSet1}}
        @file2Analyses={{this.analysesSet2}}
      />
    `);

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

    assert
      .dom('[data-test-fileCompare-header-showFilesOverview-icon]')
      .exists();

    // Tabs test
    const comparisons = compareFileAnalyses(
      this.analysesSet1,
      this.analysesSet2
    );

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
        .containsText(String(tab.badgeCount));
    });
  });

  test('it hides untested tab if show untested cases is false', async function (assert) {
    // Unknown Analysis Status
    this.project.set('showUnknownAnalysis', false);

    await render(hbs`
      <FileCompare
        @file1={{this.file1}}
        @file2={{this.file2}}
        @unknownAnalysisStatus={{this.project.showUnknownAnalysis}}
        @file1Analyses={{this.analysesSet1}}
        @file2Analyses={{this.analysesSet2}}
      />
    `);

    assert
      .dom(`[data-test-file-compare-tabs='untested-cases-tab']`)
      .doesNotExist();
  });

  test('it toggles file overview header on show more or show less icon click', async function (assert) {
    await render(hbs`
      <FileCompare
        @file1={{this.file1}}
        @file2={{this.file2}}
        @unknownAnalysisStatus={{this.project.showUnknownAnalysis}}
        @file1Analyses={{this.analysesSet1}}
        @file2Analyses={{this.analysesSet2}}
      />
    `);

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
