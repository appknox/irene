import { setupIntl } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Unit | Controller | authenticated/dashboard/sbom/scan-details',
  function (hooks) {
    setupTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.controller = this.owner.lookup(
        'controller:authenticated/dashboard/sbom/scan-details'
      );

      this.controller.model = {
        projectLastFileName: 'app.apk',
        sbomProject: { id: '1' },
        sbomFile: { id: '2' },
      };
    });

    test('breadcrumb keeps the complete analysis tab', function (assert) {
      this.controller.tab = 'complete';

      assert.deepEqual(this.controller.breadcrumbs.query, { tab: 'complete' });
    });

    test('breadcrumb has no tab query on the default insights tab', function (assert) {
      this.controller.tab = null;

      assert.strictEqual(this.controller.breadcrumbs.query, undefined);
    });
  }
);
