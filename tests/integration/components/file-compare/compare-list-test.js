import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | file-compare/compare-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // Server mocks
    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    this.server.get('/projects/:id/files', (schema) => {
      const files = schema.files.all().models;

      return {
        count: files.length,
        next: null,
        previous: null,
        results: files,
      };
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });

    // Store service
    this.store = this.owner.lookup('service:store');

    const project = this.server.create('project');
    const normalizedProject = this.store.normalize('project', project.toJSON());
    const projectRecord = this.store.push(normalizedProject);

    const vulnerabilities = this.server.createList('vulnerability', 2);

    const analyses = vulnerabilities.map((v, id) =>
      this.server.create('analysis', { id, vulnerability: v.id }).toJSON()
    );

    // File Models
    const files = this.server.createList('file', 3);
    const fileRecords = files.map((file) => {
      const normalizedFile = this.store.normalize('file', {
        ...file.toJSON(),
        analyses,
      });

      const fileModel = this.store.push(normalizedFile);
      fileModel.set('project', projectRecord);

      return fileModel;
    });

    const queryParams = {
      files_limit: 10,
      files_offset: 0,
    };

    // Common test props
    this.setProperties({
      project: projectRecord,
      fileOld: fileRecords[0],
      fileRecords,
      queryParams,
    });
  });

  test('it renders file overview header', async function (assert) {
    const breadcrumbItems = [
      t('allProjects'),
      t('scanDetails'),
      t('fileCompare.fileSelection'),
    ];

    await render(
      hbs`<FileCompare::CompareList @fileOld={{this.fileOld}} @queryParams={{this.queryParams}} @project={{this.project}} />`
    );

    assert.dom('[data-test-fileCompare-compareListHeader-container]').exists();
    assert
      .dom('[data-test-fileCompare-compareList-breadcrumbContainer]')
      .exists();

    breadcrumbItems.map((item) => {
      assert
        .dom(
          `[data-test-fileCompare-compareListHeader-breadcrumbItem="${item}"]`
        )
        .exists();
    });

    assert
      .dom('[data-test-fileCompare-compareListHeader-baseFileId]')
      .exists()
      .containsText(this.fileOld.id);

    assert
      .dom('[data-test-fileCompare-compareListHeader-compareFileId]')
      .doesNotExist();

    assert
      .dom(
        '[data-test-fileCompare-compareListHeader-compareFileSelectTextChip]'
      )
      .exists()
      .hasText(t('fileCompare.selectAFile'));

    assert
      .dom('[data-test-fileCompare-compareListHeader-compareBtn]')
      .exists()
      .hasAttribute('disabled')
      .hasText(t('compare'));
  });

  test('it renders loading state and files', async function (assert) {
    this.server.get(
      '/projects/:id/files',
      (schema) => {
        const files = schema.files.all().models;

        return {
          count: files.length,
          next: null,
          previous: null,
          results: files,
        };
      },
      { timing: 150 }
    );

    render(
      hbs`<FileCompare::CompareList @fileOld={{this.fileOld}} @queryParams={{this.queryParams}} @project={{this.project}} />`
    );

    await waitFor('[data-test-compareList-loadingContainer]', { timeout: 150 });

    assert.dom('[ data-test-compareList-filesWrapper]').exists();

    assert
      .dom('[data-test-compareList-loadingContainer]')
      .exists()
      .hasText(`${t('loading')}...`);

    await waitFor('[data-test-fileCompare-compareList-fileOverview-item]', {
      timeout: 150,
    });

    const fileOverviewItems = findAll(
      '[data-test-fileCompare-compareList-fileOverview-item]'
    );

    // Rendered files should exclude fileOld
    assert.strictEqual(fileOverviewItems.length, this.fileRecords.length - 1);

    // Sanity check first file overview
    const fileOverview1 = fileOverviewItems[0];

    // fileRecords[1] because the first file (fileRecords[0]) which is fileOld is not rendered
    assert
      .dom(fileOverview1)
      .exists()
      .containsText(this.fileRecords[1].name)
      .containsText(`${this.fileRecords[1].project.get('packageName')}`)
      .containsText(this.fileRecords[1].id)
      .containsText(this.fileRecords[1].version)
      .containsText(this.fileRecords[1].versionCode);
  });

  test('it selects and unselects a file to compare', async function (assert) {
    await render(
      hbs`<FileCompare::CompareList @fileOld={{this.fileOld}} @queryParams={{this.queryParams}} @project={{this.project}} />`
    );

    assert.dom('[ data-test-compareList-filesWrapper]').exists();

    // Disabled when compare file is not selected
    assert
      .dom('[data-test-fileCompare-compareListHeader-compareBtn]')
      .hasAttribute('disabled');

    // Selects second file in list
    const compareFile = this.fileRecords[1];
    const compareFileSelector = `[data-test-fileCompare-compareList-fileOverview='${compareFile.id}']`;

    // Selects compare file
    await click(
      `${compareFileSelector} [data-test-fileOverview-selectCheckBox]`
    );

    assert
      .dom(
        '[data-test-fileCompare-compareListHeader-compareFileSelectTextChip]'
      )
      .doesNotExist();

    assert
      .dom('[data-test-fileCompare-compareListHeader-compareBtn]')
      .doesNotHaveAttribute('disabled');

    // Unselects compare file
    await click(
      `${compareFileSelector} [data-test-fileOverview-selectCheckBox]`
    );

    assert
      .dom(
        '[data-test-fileCompare-compareListHeader-compareFileSelectTextChip]'
      )
      .exists();

    assert
      .dom('[data-test-fileCompare-compareListHeader-compareBtn]')
      .hasAttribute('disabled');
  });
});
