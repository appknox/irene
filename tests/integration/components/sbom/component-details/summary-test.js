import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { capitalize } from '@ember/string';
import * as semver from 'semver';

module(
  'Integration | Component | sbom/component-details/summary',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      // Close handler
      this.onClose = () => {};

      this.open = true;

      const store = this.owner.lookup('service:store');

      const pushStoreData = (modelName, payload) => {
        const normalized = store.normalize(modelName, payload?.toJSON());

        return store.push(normalized);
      };

      this.sbomComponent = pushStoreData(
        'sbom-component',
        this.server.create('sbom-component', {
          id: 1,
          vulnerabilities_count: 22,
        })
      );

      this.setProperties({
        sbomComponent: this.sbomComponent,
      });
    });

    test('it renders overview details', async function (assert) {
      await render(hbs`
      <Sbom::ComponentDetails::Summary @sbomComponent={{this.sbomComponent}} />
    `);

      // Tests for the component details tab
      const componentSummaryList = [
        {
          label: t('sbomModule.componentType'),
          value: capitalize(this.sbomComponent.type),
        },
        {
          label: t('dependencyType'),
          value: this.sbomComponent.isDependency
            ? t('dependencyTypes.transitive')
            : t('dependencyTypes.direct'),
        },
        {
          label: t('version'),
          value: this.sbomComponent.version,
        },
        {
          label: t('sbomModule.latestVersion'),
          value: semver.lt(
            this.sbomComponent.latestVersion,
            this.sbomComponent.version
          )
            ? '-'
            : this.sbomComponent.latestVersion,
        },
        {
          label: t('author'),
          value: this.sbomComponent.author,
        },
        {
          label: t('license'),
          value: this.sbomComponent.licenses.join(', '),
        },
      ];

      componentSummaryList.forEach((summary) => {
        assert
          .dom(
            `[data-test-sbomScanDetails-componentDetails-summary="${summary.label}"]`
          )
          .exists()
          .containsText(summary.label)
          .containsText(summary.value);
      });
    });
  }
);
