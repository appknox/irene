import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | sbom/component-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
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

  test('it renders', async function (assert) {
    await render(hbs`
      <Sbom::ComponentDetails @sbomComponent={{this.sbomComponent}} />
    `);

    assert.dom('[data-test-sbomComponentDetails-container]').exists();

    assert.dom('[data-test-sbomComponentDetails-sbomHeader]').exists();

    assert
      .dom('[data-test-sbomComponentDetails-headerTitleValue]')
      .containsText(this.sbomComponent.name);

    assert
      .dom('[data-test-sbomComponentDetails-tab="vulnerabilities"]')
      .exists();

    assert.dom('[data-test-sbomComponentDetails-tab="overview"]').exists();
  });
});
