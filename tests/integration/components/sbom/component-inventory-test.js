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

module('Integration | Component | sbom/component-inventory', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.lookup('service:router').transitionTo = () => {};

    const componentRequests = [];
    this.componentRequests = componentRequests;

    this.server.get('/v2/sb_components', (schema, request) => {
      componentRequests.push(request.queryParams);

      const results = schema.sbomComponentInventories.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_components/:id/sb_projects', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.setQuery = (component_query = '') => {
      this.set('queryParams', {
        component_limit: 10,
        component_offset: 0,
        component_query,
        component_type: '',
      });
    };
  });

  test('it renders the search prompt before any search', async function (assert) {
    this.setQuery('');

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

  test('it does not query below the minimum search length', async function (assert) {
    let requested = false;

    this.server.get('/v2/sb_components', () => {
      requested = true;

      return { count: 0, next: null, previous: null, results: [] };
    });

    this.setQuery('ju');

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    assert.false(requested, 'does not hit the backend for a 2-char query');
    assert.dom('[data-test-componentInventory-table]').doesNotExist();
    assert.dom('[data-test-componentInventory-searchPrompt]').exists();

    assert
      .dom('[data-test-helper-text]')
      .hasText(t('sbomModule.componentInventory.minSearchLengthHint'));
  });

  test('it renders results with correct cells for a query', async function (assert) {
    const versioned = this.server.create('sbom-component-inventory', {
      component_type: 'file',
      version: '4.4.3',
      status: 'VULNERABLE',
    });

    const mlModel = this.server.create('sbom-component-inventory', {
      component_type: 'machine-learning-model',
      version: '',
      status: 'SECURE',
    });

    this.setQuery('junit');

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    assert.dom('[data-test-componentInventory-table]').exists();

    const rows = findAll('[data-test-componentInventory-row]');
    assert.strictEqual(rows.length, 2, 'renders a row per component');

    const { bom_ref: versionedBomRef } = versioned.attrs;
    const { bom_ref: mlModelBomRef } = mlModel.attrs;

    // Versioned component -> full cells + status chip.
    const firstCells = rows[0].querySelectorAll('td');

    assert.dom(firstCells[0]).hasText(versionedBomRef);
    assert.dom(firstCells[1]).hasText('File');
    assert.dom(firstCells[2]).hasText(versioned.version);

    assert
      .dom('[data-test-sbomComponent-status]', rows[0])
      .hasText(t('chipStatus.vulnerable'));

    // Unversioned component -> version shows "-", but status still renders a
    // chip. This fixture is a non-vulnerable ML model, so it reads "unknown"
    // rather than "secure" -- ML models are not scored for vulnerabilities.
    const secondCells = rows[1].querySelectorAll('td');
    assert.dom(secondCells[0]).hasText(mlModelBomRef);
    assert.dom(secondCells[2]).hasText('-');

    assert
      .dom('[data-test-sbomComponent-status]', rows[1])
      .hasText(t('chipStatus.unknown'));
  });

  test('it shows an outdated chip when a newer version exists', async function (assert) {
    this.server.create('sbom-component-inventory', {
      version: '1.0.0',
      latest_version: '2.0.0',
      component_type: 'library',
      status: 'SECURE',
    });

    this.setQuery('lib');

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    const row = find('[data-test-componentInventory-row]');

    // The shared status component renders one chip per status, keyed by label.
    assert
      .dom(`[data-test-sbomComponent-status='${t('chipStatus.secure')}']`, row)
      .exists();

    assert
      .dom(
        `[data-test-sbomComponent-status='${t('chipStatus.outdated')}']`,
        row
      )
      .exists();
  });

  test('clicking a row opens the details drawer', async function (assert) {
    const component = this.server.create('sbom-component-inventory', {
      component_type: 'file',
      version: '4.4.3',
      status: 'VULNERABLE',
    });

    this.setQuery('junit');

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    assert.dom('[data-test-componentInventory-detailsFields]').doesNotExist();

    await click(find('[data-test-componentInventory-row]'));

    const { bom_ref: componentBomRef } = component.attrs;

    assert
      .dom('[data-test-componentInventory-detailsTitle]')
      .hasText(t('sbomModule.componentInventory.detailsTitle'));

    assert
      .dom('[data-test-componentInventory-detailsName]')
      .hasText(componentBomRef);

    assert.dom('[data-test-componentInventory-detailsType]').hasText('File');

    assert
      .dom('[data-test-componentInventory-detailsVersion]')
      .hasText(component.version);
  });

  test('the component-type filter sends the selected type to the backend', async function (assert) {
    this.server.create('sbom-component-inventory', {
      component_type: 'library',
      status: 'SECURE',
    });

    this.setQuery('junit');

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    // The filter sits next to the search bar, not inside the results table.
    assert
      .dom('[data-test-componentInventory-typeFilter-trigger]')
      .exists('renders the type filter beside the search bar');

    assert
      .dom('[data-test-componentInventory-typeFilter-triggerLabel]')
      .hasText(t('sbomModule.componentType'), 'shows the default label');

    assert
      .dom('[data-test-componentInventory-typeFilter-icon]')
      .hasClass(/inherit/, 'no filter applied yet');

    // Open the filter popover and pick "Library".
    await click('[data-test-componentInventory-typeFilter-trigger]');

    assert.dom('[data-test-componentInventory-typeFilter-popover]').exists();

    assert
      .dom(
        `[data-test-componentInventory-typeFilter-option='${t('all')}'] [data-test-componentInventory-typeFilter-radio]`
      )
      .isChecked('"All" is selected by default');

    await click(
      `[data-test-componentInventory-typeFilter-option='${t('library')}']`
    );

    const lastRequest =
      this.componentRequests[this.componentRequests.length - 1];

    assert.strictEqual(
      lastRequest.component_type,
      'library',
      'the CycloneDX type string is forwarded to the search endpoint'
    );

    assert.strictEqual(
      lastRequest.offset,
      '0',
      'pagination resets to page one'
    );
  });

  test('a preselected component-type filter is reflected on the trigger', async function (assert) {
    this.server.create('sbom-component-inventory', {
      component_type: 'library',
      status: 'SECURE',
    });

    this.set('queryParams', {
      component_limit: 10,
      component_offset: 0,
      component_query: 'junit',
      component_type: 'library',
    });

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    // A preselected type highlights the icon and labels the trigger.
    assert
      .dom('[data-test-componentInventory-typeFilter-icon]')
      .hasClass(/primary/, 'icon highlights when a filter is applied');

    assert
      .dom('[data-test-componentInventory-typeFilter-triggerLabel]')
      .hasText(t('library'), 'the applied type labels the trigger');

    await click('[data-test-componentInventory-typeFilter-trigger]');

    assert
      .dom(
        `[data-test-componentInventory-typeFilter-option='${t('library')}'] [data-test-componentInventory-typeFilter-radio]`
      )
      .isChecked('the applied type is preselected');
  });

  test('the filter stays reachable and clearable when a search returns no results', async function (assert) {
    this.set('queryParams', {
      component_limit: 10,
      component_offset: 0,
      component_query: 'junit',
      component_type: 'library',
    });

    await render(
      hbs`<Sbom::ComponentInventory @queryParams={{this.queryParams}} />`
    );

    assert
      .dom('[data-test-componentInventory-table]')
      .doesNotExist('no results table to host an in-table filter');

    // The filter is still visible beside the search bar and can be cleared.
    assert.dom('[data-test-componentInventory-typeFilter-trigger]').exists();

    await click('[data-test-componentInventory-typeFilter-trigger]');
    await click('[data-test-componentInventory-typeFilter-clearFilter-text]');

    const lastRequest =
      this.componentRequests[this.componentRequests.length - 1];

    assert.notOk(
      lastRequest.component_type,
      'the type param is omitted once the filter is cleared'
    );
  });
});
