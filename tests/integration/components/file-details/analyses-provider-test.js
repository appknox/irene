import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';

module(
  'Integration | Component | file-details/analyses-provider',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');

      const file = this.server.create('file');
      this.file = this.store.push(this.store.normalize('file', file.toJSON()));

      this.server.get('/v3/files/:id/analyses', (schema, req) => {
        const fileId = req.params.id;
        const records = schema.analysisOverviews
          .where({ file: fileId })
          .models.map((m) => m.toJSON());

        return {
          count: records.length,
          next: null,
          previous: null,
          results: records,
        };
      });
    });

    // ── allAnalysesCVSSAreLatest ──────────────────────────────────────────────────────

    test('it yields allAnalysesCVSSAreLatest=true when all analyses have cvssVersion === activeCvssVersion', async function (assert) {
      this.server.create('analysis-overview', {
        file: this.file.id,
        cvss_version: ENUMS.SUPPORTED_CVSS_VERSIONS.V4,
        active_cvss_version: ENUMS.SUPPORTED_CVSS_VERSIONS.V4,
      });

      this.server.create('analysis-overview', {
        file: this.file.id,
        cvss_version: ENUMS.SUPPORTED_CVSS_VERSIONS.V4,
        active_cvss_version: ENUMS.SUPPORTED_CVSS_VERSIONS.V4,
      });

      await render(hbs`
        <FileDetails::AnalysesProvider @file={{this.file}} as |apctx|>
          <div data-test-all-v4='{{apctx.allAnalysesCVSSAreLatest}}'></div>
        </FileDetails::AnalysesProvider>
      `);

      assert
        .dom('[data-test-all-v4="true"]')
        .exists(
          'allAnalysesCVSSAreLatest is true when all analyses have matching cvss versions'
        );
    });

    test('it yields allAnalysesCVSSAreLatest=false when at least one analysis has cvssVersion !== activeCvssVersion', async function (assert) {
      // v4 analysis with matching versions
      this.server.create('analysis-overview', {
        file: this.file.id,
        cvss_version: ENUMS.SUPPORTED_CVSS_VERSIONS.V4,
        active_cvss_version: ENUMS.SUPPORTED_CVSS_VERSIONS.V4,
      });

      // v3 analysis where the platform's active version is v4 (legacy analysis)
      this.server.create('analysis-overview', {
        file: this.file.id,
        cvss_version: ENUMS.SUPPORTED_CVSS_VERSIONS.V3,
        active_cvss_version: ENUMS.SUPPORTED_CVSS_VERSIONS.V4,
      });

      await render(hbs`
        <FileDetails::AnalysesProvider @file={{this.file}} as |apctx|>
          <div data-test-all-v4='{{apctx.allAnalysesCVSSAreLatest}}'></div>
        </FileDetails::AnalysesProvider>
      `);

      assert
        .dom('[data-test-all-v4="false"]')
        .exists(
          'allAnalysesCVSSAreLatest is false when some analyses have cvssVersion !== activeCvssVersion'
        );
    });

    test('it yields allAnalysesCVSSAreLatest=true when analyses list is empty', async function (assert) {
      // No analysis-overview records — empty list
      await render(hbs`
        <FileDetails::AnalysesProvider @file={{this.file}} as |apctx|>
          <div data-test-all-v4='{{apctx.allAnalysesCVSSAreLatest}}'></div>
        </FileDetails::AnalysesProvider>
      `);

      assert
        .dom('[data-test-all-v4="true"]')
        .exists(
          'allAnalysesCVSSAreLatest is true for empty analyses (Array.every vacuous truth)'
        );
    });
  }
);
