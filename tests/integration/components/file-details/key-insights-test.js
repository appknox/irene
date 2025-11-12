import { find, render, waitFor } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

import {
  compareFileAnalyses,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

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
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    const { previous_file } = setupFileModelEndpoints(this.server);

    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');
    const project = this.server.create('project', { file_count: 2 });
    const profile = this.server.create('profile', { id: '100' });

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

    const createFileAnalyses = (file, vulns = vulnerabilities) =>
      vulns.map((v) =>
        store.push(
          store.normalize(
            'analysis',
            this.server
              .create('analysis', {
                vulnerability: v.id,
                file: file.id,
              })
              .toJSON()
          )
        )
      );

    const currentFile = this.server.create('file', {
      id: 1,
      project: project.id,
      profile: profile.id,
    });

    const allFiles = [currentFile, previous_file];
    const allFileAnalyses = allFiles.map((f) => createFileAnalyses(f));

    // Current file and previous file
    const currentFileModel = store.push(
      store.normalize('file', currentFile.toJSON())
    );

    const previousFileModel = store.push(
      store.normalize('file', previous_file.toJSON())
    );

    const currentFileAnalyses = allFileAnalyses[0];
    const previousFileAnalyses = allFileAnalyses[1];

    this.setProperties({
      currentFileModel,
      previousFileModel,
      previousFileAnalyses,
      currentFileAnalyses,
      project,
      store,
    });

    await this.owner.lookup('service:organization').load();
    this.owner.register('service:notifications', NotificationsStub);
  });

  test.each(
    'it renders file-details/key-insights',
    [true, false],
    async function (assert, unknownAnalysisStatus) {
      assert.expect(unknownAnalysisStatus ? 13 : 11);

      this.server.get('/v3/projects/:id', (schema, req) => ({
        ...schema.projects.find(`${req.params.id}`)?.toJSON(),
        show_unknown_analysis: unknownAnalysisStatus,
      }));

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      await render(hbs`
        <FileDetails::KeyInsights @file={{this.currentFileModel}} @fileAnalyses={{this.currentFileAnalyses}} />
      `);

      assert
        .dom('[data-test-fileDetailKeyInsights-title]')
        .hasText(t('keyInsights'));

      assert
        .dom('[data-test-fileDetailKeyInsights-description]')
        .containsText(
          `${t('keyInsightDesc.part1')} ${t('fileID')} - ${this.previousFileModel.id}`
        );

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-fileDetailKeyInsights-description]',
        message: t('keyInsightDesc.part2', {
          uploadedOn: dayjs(this.previousFileModel.createdOn).format(
            'DD MMM YYYY'
          ),
        }),
        doIncludesCheck: true,
      });

      const comparison = getFileComparisonCategories(
        compareFileAnalyses(this.currentFileAnalyses, this.previousFileAnalyses)
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

    this.server.get('/v3/files/:id/previous_file', () => null, {
      timing: 100,
    });

    render(hbs`
      <FileDetails::KeyInsights @file={{this.currentFileModel}} @fileAnalyses={{this.currentFileAnalyses}} />
    `);

    await waitFor('[data-test-fileDetailKeyInsights-title]', { timeout: 100 });

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
