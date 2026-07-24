import { render, findAll, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

function stubComponentsEndpoint(server) {
  server.get('/v2/sb_components', (schema) => {
    const results = schema.sbomComponentInventories.all().models;

    return { count: results.length, next: null, previous: null, results };
  });

  server.get('/v2/sb_components/:id/sb_projects', () => {
    return { count: 0, next: null, previous: null, results: [] };
  });
}

module('Integration | Component | sbom/component-inventory', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders the search prompt before any search', async function (assert) {
    this.set('queryParams', {
      component_limit: 10,
      component_offset: 0,
      component_query: '',
      component_type: '',
    });

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    assert
      .dom('[data-test-componentInventory-title]')
      .hasText(t('sbomModule.componentInventory.title'));

    assert.dom('[data-test-componentInventory-description]').exists();
    assert.dom('[data-test-componentInventory-searchInput]').exists();
    assert.dom('[data-test-componentInventory-searchPrompt]').exists();

    assert
      .dom('[data-test-componentInventory-promptTitle]')
      .hasText(t('sbomModule.componentInventory.searchPromptTitle'));

    assert.dom('[data-test-componentInventory-table]').doesNotExist();
  });

  test('it renders results with correct cells for a query', async function (assert) {
    this.server.create('sbom-component-inventory', {
      id: 1,
      name: 'junit',
      namespace: 'junit',
      purl_type: 'maven',
      bom_ref: 'maven::junit:junit',
      version: '4.4.3',
      component_type: 'file',
      status: 'VULNERABLE',
    });

    this.server.create('sbom-component-inventory', {
      id: 2,
      name: 'trustkit',
      namespace: '',
      purl_type: '',
      bom_ref: 'trustkit',
      version: '',
      component_type: 'machine-learning-model',
      status: 'SECURE',
    });

    stubComponentsEndpoint(this.server);

    this.set('queryParams', {
      component_limit: 10,
      component_offset: 0,
      component_query: 'junit',
      component_type: '',
    });

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    assert.dom('[data-test-componentInventory-table]').exists();

    const rows = findAll('[data-test-componentInventory-row]');
    assert.strictEqual(rows.length, 2, 'renders a row per component');

    // Versioned component -> full cells + status chip.
    const firstCells = rows[0].querySelectorAll('td');
    assert.dom(firstCells[0]).hasText('maven::junit:junit');
    assert.dom(firstCells[1]).hasText('File');
    assert.dom(firstCells[2]).hasText('4.4.3');

    assert
      .dom('[data-test-componentInventory-status]', rows[0])
      .hasText(t('chipStatus.vulnerable'));

    // Unversioned component -> version and status show "-".
    const secondCells = rows[1].querySelectorAll('td');
    assert.dom(secondCells[2]).hasText('-');

    assert
      .dom('[data-test-componentInventory-statusEmpty]', rows[1])
      .hasText('-');
  });

  test('clicking a row opens the details drawer', async function (assert) {
    this.server.create('sbom-component-inventory', {
      id: 1,
      name: 'junit',
      namespace: 'junit',
      purl_type: 'maven',
      bom_ref: 'maven::junit:junit',
      version: '4.4.3',
      component_type: 'file',
      status: 'VULNERABLE',
    });

    stubComponentsEndpoint(this.server);

    this.set('queryParams', {
      component_limit: 10,
      component_offset: 0,
      component_query: 'junit',
      component_type: '',
    });

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    assert.dom('[data-test-componentInventory-detailsFields]').doesNotExist();

    await click(find('[data-test-componentInventory-row]'));

    assert
      .dom('[data-test-componentInventory-detailsTitle]')
      .hasText(t('sbomModule.componentInventory.detailsTitle'));

    assert
      .dom('[data-test-componentInventory-detailsName]')
      .hasText('maven::junit:junit');

    assert.dom('[data-test-componentInventory-detailsType]').hasText('File');
    assert
      .dom('[data-test-componentInventory-detailsVersion]')
      .hasText('4.4.3');
  });
});
