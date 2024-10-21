import { find, render, waitFor } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

import {
  compareFiles,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }
  success(msg) {
    this.successMsg = msg;
  }
}

module('Integration | Component | file-details/key-insights', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');

    const fileCount = 3;
    const project = this.server.create('project', { file_count: fileCount });

    //   create and push to store
    const vulnerabilities = this.server.createList('vulnerability', 5).reduce(
      (acc, curr) => [
        ...acc,
        store.push(
          store.normalize('vulnerability', {
            attributes: curr.toJSON(),
            id: curr.id,
            relationships: {},
            type: 'vulnerabilities',
          })
        ),
      ],
      []
    );

    const files = Array.from(new Array(fileCount)).map((_, idx) => {
      const analyses = vulnerabilities.map((v) =>
        this.server.create('analysis', {
          vulnerability: v.id,
        })
      );

      const profile = this.server.create('profile', { id: '100' + idx });

      return this.server.create('file', {
        id: idx + 1,
        project: project.id,
        previous_file: `/api/v2/files/${idx + 1}/previous_file`,
        analyses: analyses.map((a) => a.toJSON()),
        profile: profile.id,
      });
    });

    this.setProperties({
      file: store.push(store.normalize('file', files[fileCount - 1].toJSON())),
      store,
    });

    await this.owner.lookup('service:organization').load();
    this.owner.register('service:notifications', NotificationsStub);
  });

  test.each(
    'it renders file-details/key-insights',
    [true, false],
    async function (assert, unknownAnalysisStatus) {
      this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
        return { id: req.params.id, status: unknownAnalysisStatus };
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/v2/files/:id/previous_file', (schema, req) => {
        const previousFileId = req.params.id - 1;
        return schema.files.find(`${previousFileId}`)?.toJSON();
      });

      await render(hbs`
        <FileDetails::KeyInsights @file={{this.file}} />
      `);

      assert
        .dom('[data-test-fileDetailKeyInsights-title]')
        .hasText(t('keyInsights'));

      const previousFile = await this.file.previousFile;

      assert.dom('[data-test-fileDetailKeyInsights-description]').hasText(
        `${t('keyInsightDesc.part1')} ${t('fileID')} - ${previousFile.id} ${t(
          'keyInsightDesc.part2',
          {
            uploadedOn: dayjs(previousFile.createdOn).format('DD MMM YYYY'),
          }
        )}`
      );

      const comparison = getFileComparisonCategories(
        compareFiles(this.file, previousFile)
      );

      const keyInsights = [
        {
          label: t('fileCompare.recurringIssues'),
          value: comparison?.recurring.length,
        },
        {
          label: t('fileCompare.resolvedIssues'),
          value: comparison?.resolved.length,
        },
        {
          label: t('fileCompare.newIssues'),
          value: comparison?.newRisks.length,
        },
        unknownAnalysisStatus && {
          label: t('fileCompare.untestedIssues'),
          value: comparison?.untested.length,
        },
      ].filter(Boolean);

      keyInsights.forEach((ki) => {
        const container = find(
          `[data-test-fileDetailKeyInsights-group='${ki.label}']`
        );

        assert
          .dom('[data-test-fileDetailKeyInsights-value]', container)
          .hasText(String(ki.value));

        assert
          .dom('[data-test-fileDetailKeyInsights-label]', container)
          .hasText(ki.label);
      });

      assert
        .dom('[data-test-fileDetailKeyInsights-viewDetailsLink]')
        .hasTagName('a')
        .hasText(t('viewDetails'));
    }
  );

  test('it renders key insights loading & empty state', async function (assert) {
    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return { id: req.params.id, status: false };
    });

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/v2/files/:id/previous_file', () => null, {
      timing: 500,
    });

    render(hbs`
      <FileDetails::KeyInsights @file={{this.file}} />
    `);

    await waitFor('[data-test-fileDetailKeyInsights-title]', { timeout: 500 });

    assert
      .dom('[data-test-fileDetailKeyInsights-title]')
      .hasText(t('keyInsights'));

    assert.dom('[data-test-fileDetailKeyInsights-loader]').exists();

    assert
      .dom('[data-test-fileDetailKeyInsights-loadingText]')
      .hasText(`${t('loading')}...`);

    await waitFor('[data-test-fileDetailKeyInsights-emptyTitle]', {
      timeout: 500,
    });

    assert
      .dom('[data-test-fileDetailKeyInsights-emptyTitle]')
      .hasText(t('fileCompare.noDataAvailable'));

    assert
      .dom('[data-test-fileDetailKeyInsights-emptyDescription]')
      .hasText(t('fileCompare.uploadMoreFileDescription'));

    assert.dom('[data-test-fileDetailKeyInsights-emptySvg]').exists();

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.errorMsg, null);
  });
});
