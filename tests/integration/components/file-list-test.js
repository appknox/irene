import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { selectChoose } from 'ember-power-select/test-support';

import Service from '@ember/service';

class RouterStub extends Service {
  currentRouteName = 'authenticated.dashboard.project.files';

  transitionTo(routeNameOrQueryParams) {
    this.currentRouteName = routeNameOrQueryParams;
  }
}

module('Integration | Component | file-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);

    // Server mocks
    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    this.server.get('/v3/projects/:id/files', (schema) => {
      const files = schema.files.all().models;

      return {
        count: files.length,
        next: null,
        previous: null,
        results: files,
      };
    });

    this.server.get('/v3/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });

    // Store service
    const store = this.owner.lookup('service:store');

    const project = this.server.create('project', {
      is_manual_scan_available: true,
    });

    const normalizedProject = store.normalize('project', project.toJSON());
    const projectRecord = store.push(normalizedProject);

    const vulnerabilities = this.server.createList('vulnerability', 3);

    const analyses = vulnerabilities.map((v, id) =>
      this.server.create('analysis', { id, vulnerability: v.id }).toJSON()
    );

    // File Models
    const files = Array.from({ length: 3 }).map((_, i) => {
      return this.server.create('file', {
        is_api_done: i === 0,
        is_static_done: i === 1,
        is_dynamic_done: i === 0,
        is_manual_done: i === 1,
      });
    });

    const fileRecords = files.map((file) => {
      const normalizedFile = store.normalize('file', {
        ...file.toJSON(),
        analyses,
      });

      const fileModel = store.push(normalizedFile);
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
      fileRecords,
      queryParams,
    });
  });

  test('it renders project overview header', async function (assert) {
    await render(
      hbs`<FileList @project={{this.project}} @queryParams={{this.queryParams}} />`
    );

    assert.dom('[data-test-fileList-projectOverview-container]').exists();

    assert
      .dom('[data-test-fileList-projectOverview-header]')
      .exists()
      .containsText(t('allUploads'));

    assert
      .dom('[data-test-fileList-projectOverview-headerFileCompare]')
      .doesNotExist();

    assert
      .dom('[data-test-fileList-projectOverview-header-noSelectedFileText]')
      .exists()
      .hasText(t('fileList.selectFilesHeaderText'));

    assert
      .dom('[data-test-fileList-projectOverview-header-compareBtn]')
      .doesNotExist();
  });

  test('it renders loading state and files', async function (assert) {
    this.server.get(
      '/v3/projects/:id/files',
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
      hbs`<FileList @project={{this.project}} @queryParams={{this.queryParams}} />`
    );

    await waitFor('[data-test-fileList-loadingContainer]', { timeout: 150 });

    assert.dom('[data-test-fileList-wrapper]').exists();

    assert
      .dom('[data-test-fileList-loadingContainer]')
      .exists()
      .hasText(`${t('loading')}...`);

    await waitFor('[data-test-fileList-fileOverview-item]', { timeout: 150 });

    const fileOverviewItems = findAll('[data-test-fileList-fileOverview-item]');

    assert.strictEqual(fileOverviewItems.length, this.fileRecords.length);

    // Sanity check first file overview
    const fileOverview1 = fileOverviewItems[0];

    assert
      .dom(fileOverview1)
      .exists()
      .containsText(this.fileRecords[0].name)
      .containsText(`${this.fileRecords[0].project.get('packageName')}`)
      .containsText(this.fileRecords[0].id)
      .containsText(this.fileRecords[0].version)
      .containsText(this.fileRecords[0].versionCode)
      .containsText(this.fileRecords[0].versionCode);

    assert
      .dom('[data-test-fileOverview-selectCheckBox]', fileOverview1)
      .exists();

    assert
      .dom('[data-test-fileOverview-openInNewTabLink]', fileOverview1)
      .exists();
  });

  test('it selects and unselects two files to compare', async function (assert) {
    await render(
      hbs`<FileList @project={{this.project}} @queryParams={{this.queryParams}} />`
    );

    assert.dom('[data-test-fileList-wrapper]').exists();

    const [baseFile, compareFile] = this.fileRecords;

    const baseFileSelector = `[data-test-fileList-fileOverview='${baseFile.id}']`;
    const compareFileSelector = `[data-test-fileList-fileOverview='${compareFile.id}']`;

    // Selects only base file
    await click(`${baseFileSelector} [data-test-fileOverview-selectCheckBox]`);

    assert
      .dom('[data-test-fileList-projectOverview-header-noSelectedFileText]')
      .doesNotExist();

    assert
      .dom('[data-test-fileList-projectOverview-headerFileCompare]')
      .exists();

    assert
      .dom(
        '[data-test-fileList-projectOverview-headerFileCompare-summaryText1]'
      )
      .exists()
      .hasText(t('fileCompare.summary1'));

    assert
      .dom(
        '[data-test-fileList-projectOverview-headerFileCompare-summaryText2]'
      )
      .exists()
      .hasText(t('fileCompare.summary2'));

    assert
      .dom('[data-test-fileList-projectOverview-header-compareBtn]')
      .exists()
      .hasText(t('compare'));

    assert
      .dom(
        '[data-test-fileList-projectOverview-headerFileCompare-baseFileChip]'
      )
      .exists()
      .hasText(baseFile.id);

    assert
      .dom(
        '[data-test-fileList-projectOverview-headerFileCompare-baseFileSelectText]'
      )
      .doesNotExist();

    assert
      .dom(
        '[data-test-fileList-projectOverview-headerFileCompare-compareFileChip]'
      )
      .doesNotExist();

    assert
      .dom(
        '[data-test-fileList-projectOverview-headerFileCompare-compareFileSelectText]'
      )
      .exists()
      .hasText(t('fileCompare.selectCompareFile'));

    // Selects compare  file
    await click(
      `${compareFileSelector} [data-test-fileOverview-selectCheckBox]`
    );

    assert
      .dom(
        '[data-test-fileList-projectOverview-headerFileCompare-compareFileSelectText]'
      )
      .doesNotExist();

    // Unselects base file
    await click(`${baseFileSelector} [data-test-fileOverview-selectCheckBox]`);

    assert
      .dom(
        '[data-test-fileList-projectOverview-headerFileCompare-baseFileChip]'
      )
      .doesNotExist();

    assert
      .dom(
        '[data-test-fileList-projectOverview-headerFileCompare-baseFileSelectText]'
      )
      .exists()
      .hasText(t('fileCompare.selectAFile'));

    // Unselects compare file
    await click(
      `${compareFileSelector} [data-test-fileOverview-selectCheckBox]`
    );

    assert
      .dom('[data-test-fileList-projectOverview-header-noSelectedFileText]')
      .exists();

    assert
      .dom('[data-test-fileList-projectOverview-header-compareBtn]')
      .doesNotExist();

    assert
      .dom('[data-test-fileList-projectOverview-headerFileCompare]')
      .doesNotExist();
  });

  test('it should disable other files in list if two files have already been selected', async function (assert) {
    const [baseFile, compareFile, otherFile] = this.fileRecords;

    const baseFileSelector = `[data-test-fileList-fileOverview='${baseFile.id}']`;
    const compareFileSelector = `[data-test-fileList-fileOverview='${compareFile.id}']`;

    const otherFileSelector = `[data-test-fileList-fileOverview='${otherFile.id}']`;

    await render(
      hbs`<FileList @project={{this.project}} @queryParams={{this.queryParams}} />`
    );

    // Selects base and compare files
    await click(`${baseFileSelector} [data-test-fileOverview-selectCheckBox]`);

    await click(
      `${compareFileSelector} [data-test-fileOverview-selectCheckBox]`
    );

    assert
      .dom(`${otherFileSelector} [data-test-fileOverview-selectCheckBox]`)
      .exists()
      .hasAttribute('disabled');

    // Deselects base file
    await click(
      '[data-test-fileList-projectOverview-headerFileCompare-baseFileChip] [data-test-chip-delete-btn]'
    );

    assert
      .dom(`${otherFileSelector} [data-test-fileOverview-selectCheckBox]`)
      .exists()
      .doesNotHaveAttribute('disabled');
  });

  test.each(
    'It filters files list when scan type value changes and also clears filter',
    [
      {
        flag: 'is_static_done',
        scanTypeValue: 0,
        selectOption: 1,
      },
      {
        flag: 'is_dynamic_done',
        scanTypeValue: 1,
        selectOption: 2,
      },
      {
        flag: 'is_api_done',
        scanTypeValue: 2,
        selectOption: 3,
      },
      {
        flag: 'is_manual_done',
        scanTypeValue: 3,
        selectOption: 4,
      },
    ],
    async function (assert, obj) {
      this.server.get('/v3/projects/:id/files', (schema, req) => {
        const scanType = req.queryParams.scan_type;

        this.set('scanType', scanType);

        const scanTypeInt = parseInt(scanType);

        const files = schema.files.all().models;

        const results =
          scanTypeInt === obj.scanTypeValue
            ? files.filter((p) => p[obj.flag])
            : files;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(
        hbs`<FileList @project={{this.project}} @queryParams={{this.queryParams}} />`
      );

      let fileContainerList = findAll('[data-test-fileList-fileOverview-item]');

      assert.strictEqual(
        fileContainerList.length,
        this.fileRecords.length,
        'Contains correct number of file overview cards.'
      );

      await waitFor('[data-test-select-scan-type-container]', {
        timeout: 1000,
      });

      await clickTrigger('[data-test-select-scan-type-container]');

      await waitFor('.ember-power-select-option', { timeout: 1000 });

      await selectChoose(
        '.select-scan-type-class',
        '.ember-power-select-option',
        obj.selectOption
      );

      assert.strictEqual(this.scanType, String(obj.scanTypeValue));

      fileContainerList = findAll('[data-test-fileList-fileOverview-item]');

      assert.strictEqual(
        fileContainerList.length,
        1,
        'File list items all have scan type value matching particular Scan.'
      );

      assert.dom('[data-test-fileList-header-clear-filter]').exists();

      // Clear Filter
      await click('[data-test-fileList-header-clear-filter]');

      fileContainerList = findAll('[data-test-fileList-fileOverview-item]');

      assert.strictEqual(
        fileContainerList.length,
        this.fileRecords.length,
        'File list defaults to complete list when scan type value is all.'
      );
    }
  );
});
