import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { capitalize } from '@ember/string';

module('Integration | Component | sbom/component-details', function (hooks) {
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
  });

  test('it renders', async function (assert) {
    await render(hbs`
      <Sbom::ComponentDetails @sbomComponent={{this.sbomComponent}} />
    `);

    assert.dom('[data-test-sbomComponentDetails-container]').exists();

    assert
      .dom('[data-test-sbomComponentDetails-title]')
      .hasText(t('sbomModule.componentDetails'));

    assert
      .dom('[data-test-sbomComponentDetails-description]')
      .hasText(t('sbomModule.componentDetailsDescription'));

    assert
      .dom('[data-test-sbomComponentDetails-headerTitleLabel]')
      .hasText(t('sbomModule.componentName'));

    assert
      .dom('[data-test-sbomComponentDetails-headerTitleValue]')
      .hasText(this.sbomComponent.name);

    // By default the content is collapsed"
    assert
      .dom('[data-test-sbomSummaryHeader-collapsibleToggleBtn]')
      .isNotDisabled();

    assert
      .dom('[data-test-sbomSummaryHeader-collapsibleContent]')
      .doesNotExist();

    assert
      .dom('[data-test-sbomScanDetails-componentDetails-summary]')
      .doesNotExist();

    assert.dom('[data-test-sbomComponentVulnerabilities]').exists();
  });

  test('it toggles & renders component details summary', async function (assert) {
    await render(hbs`
      <Sbom::ComponentDetails @sbomComponent={{this.sbomComponent}} />
    `);

    assert.dom('[data-test-sbomComponentDetails-container]').exists();

    // By default the content is collapsed"
    assert
      .dom('[data-test-sbomSummaryHeader-collapsibleToggleBtn]')
      .isNotDisabled();

    assert
      .dom('[data-test-sbomSummaryHeader-collapsibleContent]')
      .doesNotExist();

    assert
      .dom('[data-test-sbomScanDetails-componentDetails-summary]')
      .doesNotExist();

    await click('[data-test-sbomSummaryHeader-collapsibleToggleBtn]');

    assert.dom('[data-test-sbomSummaryHeader-collapsibleContent]').exists();
    assert.dom('[data-test-sbomScanDetails-componentDetails-summary]').exists();

    // Tests for the component details tab
    const componentSummaryList = [
      {
        label: t('sbomModule.componentType'),
        value: capitalize(this.sbomComponent.type),
      },
      {
        label: t('version'),
        value: this.sbomComponent.version,
      },
      {
        label: t('sbomModule.latestVersion'),
        value: this.sbomComponent.latestVersion,
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

    // assert
    //   .dom('[data-test-sbomScanDetails-componentDetails-howToFixTitle]')
    //   .hasText(t('howToFix'));

    // assert
    //   .dom('[data-test-sbomScanDetails-componentDetails-howToFixRemedy]')
    //   .hasText(this.sbomComponent.remediation);

    // collapse summary
    await click('[data-test-sbomSummaryHeader-collapsibleToggleBtn]');

    assert
      .dom('[data-test-sbomScanDetails-componentDetails-summary]')
      .doesNotExist();
  });
});
