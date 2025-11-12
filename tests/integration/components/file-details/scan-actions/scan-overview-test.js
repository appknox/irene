import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module(
  'Integration | Component | file-details/scan-actions/scan-overview',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      setupFileModelEndpoints(this.server);

      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', {
        project: '1',
      });

      this.server.create('project', { last_file: file, id: '1' });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        store,
      });

      await this.owner.lookup('service:organization').load();
    });

    test('it renders scan overview with vulnerability count', async function (assert) {
      this.setProperties({
        vulnerabilityCount: 5,
        isDynamicScanAction: false,
      });

      await render(hbs`
        <FileDetails::ScanActions::ScanOverview
          @file={{this.file}}
          @vulnerabilityCount={{this.vulnerabilityCount}}
          @isDynamicScanAction={{this.isDynamicScanAction}}
        />
      `);

      assert
        .dom('[data-test-fileDetails-scanActions-scanOverview-root]')
        .exists();

      assert
        .dom('[data-test-fileDetails-scanActions-scanOverview-root]')
        .containsText(t('scanOverview'));

      assert
        .dom(
          '[data-test-fileDetails-scanActions-scanOverview-vulnerabilitiesFoundIcon]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-scanActions-scanOverview-vulnerabilitiesFoundValue]'
        )
        .hasText(String(this.vulnerabilityCount));

      // screen coverage is not displayed when isDynamicScanAction is false
      assert
        .dom(
          '[data-test-fileDetails-scanActions-scanOverview-screenCoverageRoot]'
        )
        .doesNotExist();
    });

    test('it renders dynamic scan coverage when isDynamicScanAction is true', async function (assert) {
      this.setProperties({
        vulnerabilityCount: 3,
        isDynamicScanAction: true,
      });

      // Scan coverage model
      const scan_coverage = this.server.create('scan-coverage', {
        status: ENUMS.SCAN_COVERAGE_STATUS.COMPLETED,
        is_any_screen_coverage_complete: true,
      });

      this.scanCoverage = this.store.push(
        this.store.normalize('scan-coverage', scan_coverage.toJSON())
      );

      // Server mocks
      this.server.get('/v2/files/:id/screen_coverage', (schema) => {
        return schema.scanCoverages.find(`${scan_coverage.id}`)?.toJSON();
      });

      await render(hbs`
        <FileDetails::ScanActions::ScanOverview
          @file={{this.file}}
          @vulnerabilityCount={{this.vulnerabilityCount}}
          @isDynamicScanAction={{this.isDynamicScanAction}}
        />
      `);

      // Check that basic vulnerability elements still exist
      assert
        .dom(
          '[data-test-fileDetails-scanActions-scanOverview-vulnerabilitiesFoundIcon]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-scanActions-scanOverview-vulnerabilitiesFoundValue]'
        )
        .hasText(String(this.vulnerabilityCount));

      // Check that screen coverage is displayed correctly
      assert
        .dom(
          '[data-test-fileDetails-scanActions-scanOverview-screenCoverageRoot]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-scanActions-scanOverview-screenCoverageIcon]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-scanActions-scanOverview-screenCoverageValue]'
        )
        .hasText(`${String(this.scanCoverage.coverage)}%`);
    });

    test.each(
      'it handles different vulnerability count scenarios',
      [
        { count: 1, expected: '1' },
        { count: 0, expected: '0' },
        { count: null, expected: '-' },
      ],
      async function (assert, { count, expected }) {
        this.setProperties({
          vulnerabilityCount: count,
          isDynamicScanAction: false,
        });

        await render(hbs`
          <FileDetails::ScanActions::ScanOverview
            @file={{this.file}}
            @vulnerabilityCount={{this.vulnerabilityCount}}
            @isDynamicScanAction={{this.isDynamicScanAction}}
          />
        `);

        assert
          .dom(
            '[data-test-fileDetails-scanActions-scanOverview-vulnerabilitiesFoundValue]'
          )
          .hasText(expected);
      }
    );
  }
);
