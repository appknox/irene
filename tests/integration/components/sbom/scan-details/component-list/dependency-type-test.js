import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/scan-details/component-list/dependency-type',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      this.sbomComponent = store.createRecord('sbom-component', {
        isDependency: true,
        via: 'okhttp',
      });
    });

    test('it shows the via line only when @showVia is set', async function (assert) {
      this.showVia = true;

      await render(hbs`
        <Sbom::ScanDetails::ComponentList::DependencyType
          @sbomComponent={{this.sbomComponent}}
          @showVia={{this.showVia}}
        />
      `);

      assert
        .dom('[data-test-sbomComponent-dependencyType]')
        .hasText(t('dependencyTypes.transitive'));

      assert
        .dom('[data-test-sbomComponent-dependencyVia]')
        .hasText(t('sbomModule.viaComponent', { component: 'okhttp' }));

      this.set('showVia', false);

      assert.dom('[data-test-sbomComponent-dependencyVia]').doesNotExist();
    });
  }
);
