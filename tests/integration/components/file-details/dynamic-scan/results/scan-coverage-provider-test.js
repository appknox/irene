import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module(
  'Integration | Component | file-details/dynamic-scan/results/scan-coverage-provider',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
      setupFileModelEndpoints(this.server);
      this.server.createList('organization', 1);
      this.server.create('project', { id: '1' });
    });

    const renderFor = async (context, devFramework) => {
      const store = context.owner.lookup('service:store');

      const file = context.server.create('file', {
        project: '1',
        dev_framework: devFramework,
      });

      context.file = store.push(store.normalize('file', file.toJSON()));

      context.requests = 0;

      context.server.get('/v2/files/:id/screen_coverage', () => {
        context.requests += 1;

        return {};
      });

      await render(hbs`
        <FileDetails::DynamicScan::Results::ScanCoverageProvider @file={{this.file}} as |ctx|>
          <span data-test-ctx>{{if ctx.isOldFileWithNoCoverage "old"}}</span>
        </FileDetails::DynamicScan::Results::ScanCoverageProvider>
      `);
    };

    test('it does not request screen coverage for an unsupported framework', async function (assert) {
      await renderFor(this, ENUMS.FILE_DEV_FRAMEWORK.ANDROID_FLUTTER);

      assert.strictEqual(this.requests, 0);
    });

    test('it requests screen coverage for a supported framework', async function (assert) {
      await renderFor(this, ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE);

      assert.strictEqual(this.requests, 1);
    });

    test('it still requests screen coverage when the framework is unknown', async function (assert) {
      await renderFor(this, ENUMS.FILE_DEV_FRAMEWORK.UNKNOWN);

      assert.strictEqual(this.requests, 1);
    });
  }
);
