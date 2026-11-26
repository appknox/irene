import { setupIntl } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Unit | Controller | authenticated/dashboard/sbom/component-insights',
  function (hooks) {
    setupTest(hooks);
    setupIntl(hooks, 'en');

    test('breadcrumbs return to the reachability insights tab', function (assert) {
      const controller = this.owner.lookup(
        'controller:authenticated/dashboard/sbom/component-insights'
      );

      controller.model = {
        sbomProject: { id: '1' },
        sbomFile: { id: '2' },
        sbomComponent: { id: '3' },
        projectLastFile: { get: () => 'app.apk' },
        queryParams: { sbom_component_parent_id: '0' },
      };

      const { parentCrumb, title, route } = controller.breadcrumbs;

      assert.strictEqual(
        route,
        'authenticated.dashboard.sbom.component-insights'
      );

      assert.notStrictEqual(title, 'Component Details');
      assert.strictEqual(
        parentCrumb.route,
        'authenticated.dashboard.sbom.scan-details'
      );
      assert.deepEqual(parentCrumb.models, ['1', '2']);
      // Insights is the default tab, so no query is needed to return to it.
      assert.strictEqual(parentCrumb.query, undefined);
    });
  }
);
