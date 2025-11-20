import { visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

module('Acceptance | file-details/api-download', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    // Store
    const store = this.owner.lookup('service:store');

    const { organization } = await setupRequiredEndpoints(this.server);

    // Models
    const profile = this.server.create('profile');

    const file = this.server.create('file', {
      id: 1,
      project: '1',
      profile: profile.id,
      is_active: true,
    });

    const project = this.server.create('project', {
      file: file.id,
      id: '1',
      active_profile_id: profile.id,
    });

    // server api interception
    this.server.get('/v2/server_configuration', () => ({}));
    this.server.get('/v2/dashboard_configuration', () => ({}));

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/v2/dynamicscans/:id', (schema, req) => {
      return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id/dynamicscans', (schema, req) => {
      const { limit, mode } = req.queryParams || {};

      const results = schema.dynamicscans
        .where({
          file: req.params.id,
          ...(mode ? { mode: Number(mode) } : {}),
        })
        .models.slice(0, limit ? Number(limit) : results.length);

      return {
        count: results.length,
        next: null,
        previous: null,
        results,
      };
    });

    this.server.get('/v2/files/:id/screen_coverage', (schema, req) => {
      return schema.scanCoverages.find(`${req.params.id}`)?.toJSON();
    });

    // Set properties
    this.setProperties({
      organization,
      file: store.push(store.normalize('file', file.toJSON())),
      project: store.push(store.normalize('project', project.toJSON())),
      store,
    });
  });

  /**
   * ================================================
   * TEST: RENDERS WITH OR WITHOUT CAPTURED APIS
   * ================================================
   */
  test.each(
    'it renders with or without cumulative captured APIs',
    [0, 1],
    async function (assert, count) {
      assert.expect(5);

      const hasApisCaptured = count > 0;

      this.server.get('/v2/files/:id/capi_reports/total_capi_count', () => ({
        count,
      }));

      await visit(
        `/dashboard/file/${this.file.id}/dynamic-scan/results/apis-captured`
      );

      const capisHeaderText = hasApisCaptured
        ? t('apiScanModule.uniqueApisRequestsCaptured', {
            count,
          })
        : t('apiScanModule.noUniqueApisRequestsCaptured');

      const capisDescriptionText = hasApisCaptured
        ? t('apiScanModule.cumulativeDataOfDASTScan')
        : t('apiScanModule.performDASTScanByEnablingAPI');

      assert
        .dom('[data-test-fileDetails-dynamicScan-results-apis-captured]')
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-apis-captured-header-text]'
        )
        .hasText(capisHeaderText);

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-apis-captured-description-text]'
        )
        .hasText(capisDescriptionText);

      const capisDownloadBtnSelector =
        '[data-test-fileDetails-dynamicScan-results-apis-captured-download-btn]';

      assert
        .dom(capisDownloadBtnSelector)
        .hasText(t('apiScanModule.downloadApis'));

      if (hasApisCaptured) {
        assert.dom(capisDownloadBtnSelector).isNotDisabled();
      } else {
        assert.dom(capisDownloadBtnSelector).isDisabled();
      }
    }
  );
});
