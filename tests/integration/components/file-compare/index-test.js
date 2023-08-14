import { module, test } from 'qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  compareFiles,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';
import Service from '@ember/service';

class RouterStub extends Service {
  currentRouteName = 'authenticated.project.files';
  currentRoute = { queryParams: { referrer: 'all_uploads' } };

  transitionTo(routeName) {
    this.currentRouteName = routeName;
  }
}

module('Integration | Component | file-compare', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
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

    this.setProperties({
      file1,
      file2,
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
    const breadcrumbItems = [
      't:allProjects:()',
      't:scanDetails:()',
      't:fileCompare.fileSelection:()',
      't:compare:()',
    ];

    await render(
      hbs`<FileCompare
          @file1={{this.file1}} 
          @file2={{this.file2}}
        />`
    );

    assert.dom('[data-test-fileCompare-header]').exists();
    assert.dom('[data-test-fileCompare-breadcrumbContainer]').exists();

    breadcrumbItems.map((item) =>
      assert.dom(`[data-test-fileCompare-breadcrumbItem="${item}"]`).exists()
    );

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
    //   .hasText('t:downloadReport:()');

    assert
      .dom('[data-test-fileCompare-header-showFilesOverview-icon]')
      .exists();

    // Tabs test
    const comparisons = compareFiles(this.file1, this.file2);
    const fileCompareCategories = getFileComparisonCategories(comparisons);

    const tabs = [
      {
        id: 'new-issues',
        label: 't:fileCompare.newIssues:()',
        badgeCount: fileCompareCategories.newRisks.length,
      },
      {
        id: 'recurring-issues',
        label: 't:fileCompare.recurringIssues:()',
        badgeCount: fileCompareCategories.recurring.length,
      },
      {
        id: 'resolved-issues',
        label: 't:fileCompare.resolvedIssues:()',
        badgeCount: fileCompareCategories.resolved.length,
      },
      {
        id: 'untested-cases',
        label: 't:fileCompare.untested:()',
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

  test('it renders all upload page breadcrumbs if page referrer is "all_uploads"', async function (assert) {
    this.owner.register('service:router', RouterStub);

    const breadcrumbItems = [
      't:allProjects:()',
      this.file1?.project?.get('packageName'),
      't:compare:()',
    ];

    await render(
      hbs`<FileCompare
          @file1={{this.file1}} 
          @file2={{this.file2}}
        />`
    );

    assert.dom('[data-test-fileCompare-header]').exists();
    assert.dom('[data-test-fileCompare-breadcrumbContainer]').exists();

    breadcrumbItems.map((item) =>
      assert.dom(`[data-test-fileCompare-breadcrumbItem="${item}"]`).exists()
    );
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

  test('it redirects to compare list page if compare file edit icon is clicked and page referrer is empty', async function (assert) {
    class RouterStub extends Service {
      currentRouteName = 'authenticated.project.files';

      transitionTo(routeName) {
        this.currentRouteName = routeName;
      }
    }

    this.owner.register('service:router', RouterStub);

    await render(
      hbs`<FileCompare
          @file1={{this.file1}} 
          @file2={{this.file2}}
        />`
    );

    assert.dom('[data-test-fileCompare-header-compareFileEditIcon]').exists();

    await click('[data-test-fileCompare-header-compareFileEditIcon]');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentRouteName, 'authenticated.choose');
  });

  test('it redirects to all uploads page if compare file edit icon is clicked and page referrer is "all_uploads"', async function (assert) {
    this.owner.register('service:router', RouterStub);

    await render(
      hbs`<FileCompare
          @file1={{this.file1}} 
          @file2={{this.file2}}
        />`
    );

    assert.dom('[data-test-fileCompare-header-compareFileEditIcon]').exists();

    await click('[data-test-fileCompare-header-compareFileEditIcon]');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentRouteName, 'authenticated.project.files');
  });
});
