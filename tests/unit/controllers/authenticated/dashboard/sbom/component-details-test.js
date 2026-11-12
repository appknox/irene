import { setupIntl } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Unit | Controller | authenticated/dashboard/sbom/component-details',
  function (hooks) {
    setupTest(hooks);
    setupIntl(hooks, 'en');

    test('the parent crumb returns to the complete tab', function (assert) {
      const controller = this.owner.lookup(
        'controller:authenticated/dashboard/sbom/component-details'
      );

      controller.model = {
        sbomProject: { id: '1' },
        sbomFile: { id: '2' },
        sbomComponent: { id: '3' },
        projectLastFile: { get: () => 'app.apk' },
      };

      const { parentCrumb } = controller.breadcrumbs;

      assert.strictEqual(
        parentCrumb.route,
        'authenticated.dashboard.sbom.scan-details'
      );

      assert.deepEqual(parentCrumb.query, { tab: 'complete' });
    });
  }
);
