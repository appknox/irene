import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { capitalize } from '@ember/string';
import * as semver from 'semver';

import { ReachabilityVerdict } from 'irene/utils/sbom-reachability';

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

    test('it renders a reachability row when a path was found', async function (assert) {
      await render(hbs`
        <Sbom::ComponentDetails::Summary @sbomComponent={{this.sbomComponent}} />
      `);

      const row = find(
        `[data-test-sbomScanDetails-componentDetails-summary="${t('sbomModule.reachability.title')}"]`
      );

      assert.dom(row).containsText(t('sbomModule.reachability.title'));
      assert
        .dom(
          '[data-test-sbomScanDetails-componentDetails-reachabilityCountLabel="path-found"]',
          row
        )
        .hasText(t('sbomModule.reachability.pathFound'));
      assert
        .dom(
          '[data-test-sbomScanDetails-componentDetails-reachabilityCountValue="path-found"]',
          row
        )
        .hasText('1');
      assert
        .dom(
          '[data-test-sbomScanDetails-componentDetails-reachabilityCountLabel="potential"]',
          row
        )
        .hasText(t('sbomModule.reachability.potential'));
      assert
        .dom(
          '[data-test-sbomScanDetails-componentDetails-reachabilityCountValue="potential"]',
          row
        )
        .hasText('2');
      assert
        .dom(
          '[data-test-sbomScanDetails-componentDetails-reachabilityCountLabel="no-path-found"]',
          row
        )
        .hasText(t('sbomModule.reachability.noPathFound'));
      assert
        .dom(
          '[data-test-sbomScanDetails-componentDetails-reachabilityCountValue="no-path-found"]',
          row
        )
        .hasText('1');
      assert
        .dom(
          '[data-test-sbomScanDetails-componentDetails-reachabilityCountLabel="unknown"]',
          row
        )
        .hasText(t('unknown'));
      assert
        .dom(
          '[data-test-sbomScanDetails-componentDetails-reachabilityCountValue="unknown"]',
          row
        )
        .hasText('2');
    });

    test('it hides the reachability row when every advisory is unknown', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomComponent = store.push(
        store.normalize(
          'sbom-component',
          this.server
            .create('sbom-component', {
              id: 2,
              reachability: {
                verdict: ReachabilityVerdict.UNKNOWN,
                path_found_count: 0,
                advisory_count: 4,
                unknown_count: 4,
              },
            })
            .toJSON()
        )
      );

      await render(hbs`
        <Sbom::ComponentDetails::Summary @sbomComponent={{this.sbomComponent}} />
      `);

      assert
        .dom(
          `[data-test-sbomScanDetails-componentDetails-summary="${t('sbomModule.reachability.title')}"]`
        )
        .doesNotExist();
    });
  }
);
