import { fillIn, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | production-scan/table', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('it should show only table headers and no-content message for disabled settings state', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: false,
    });

    const prodScanRoute = this.owner.lookup(
      'route:authenticated/production-scan'
    );

    this.set('prodScanTableData', {
      results: prodScanRoute.createProdScanTableData(31),
      count: 0,
    });

    await render(
      hbs`<ProductionScan::Table @settings={{this.settings}} @prodScanTableData={{this.prodScanTableData}} />`
    );
    assert.dom(`[data-test-production-scan-table]`).exists();
    assert.dom(`[data-test-table-header-container]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-table-header]`).length,
      5,
      'Should have five (5) table headers'
    );
    assert.dom('[data-test-empty-prod-data-container]').exists();
    assert.dom('[data-test-empty-prod-data-illustration]').exists();
    assert
      .dom('[data-test-empty-prod-data-container]')
      .containsText('t:productionScanDisabledDesc.header:()')
      .containsText('t:productionScanDisabledDesc.body:()');
  });

  test('it should show only table headers and no-content message for enabled settings state if table data is less than one', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    this.set('prodScanTableData', {
      results: [],
      count: 0,
    });

    await render(
      hbs`<ProductionScan::Table @settings={{this.settings}} @prodScanTableData={{this.prodScanTableData}} />`
    );
    assert.dom(`[data-test-production-scan-table]`).exists();
    assert.dom(`[data-test-table-header-container]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-table-header]`).length,
      5,
      'Should have five (5) table headers'
    );
    assert.dom('[data-test-empty-prod-data-container]').exists();
    assert.dom('[data-test-empty-prod-data-illustration]').exists();
    assert
      .dom('[data-test-empty-prod-data-container]')
      .containsText('t:productionScanEmptyDesc.header:()')
      .containsText('t:productionScanEmptyDesc.body:()');
  });

  test('it should show table rows if settings is enabled and table data is more than zero', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    const prodScanRoute = this.owner.lookup(
      'route:authenticated/production-scan'
    );

    this.set('prodScanTableData', {
      results: prodScanRoute.createProdScanTableData(5),
      count: 5,
    });

    await render(
      hbs`<ProductionScan::Table @settings={{this.settings}} @prodScanTableData={{this.prodScanTableData}} />`
    );
    assert.dom(`[data-test-production-scan-table]`).exists();
    assert.dom(`[data-test-table-header-container]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-table-header]`).length,
      5,
      'Should have five (5) table headers'
    );
    assert.dom('[data-test-empty-prod-data-container]').doesNotExist();
    assert.dom('[data-test-prod-scan-table-body]').exists();
    assert.dom('[data-test-table-row]').exists();
    assert.strictEqual(
      this.element.querySelectorAll('[data-test-table-row]').length,
      5,
      'Should have five (5) scanned projects - [data-test-table-row]'
    );
  });

  test('it should render the actual table data in each rows', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    const prodScanRoute = this.owner.lookup(
      'route:authenticated/production-scan'
    );

    this.set('prodScanTableData', {
      results: prodScanRoute.createProdScanTableData(2),
      count: 20,
    });

    await render(
      hbs`<ProductionScan::Table @settings={{this.settings}} @prodScanTableData={{this.prodScanTableData}} />`
    );

    assert.dom('[data-test-prod-scan-table-body]').exists();
    assert.dom('[data-test-table-row]').exists();

    const allTableRows = this.element.querySelectorAll('[data-test-table-row]');

    assert.strictEqual(
      allTableRows.length,
      this.prodScanTableData.results.length,
      'Should have five (5) scanned projects - [data-test-table-row]'
    );

    for (let row = 0; row < allTableRows.length; row++) {
      const prodScanMatchingData = this.prodScanTableData.results[row];

      assert
        .dom(
          `[data-test-table-row-id="${row}"] [data-test-table-row-app-namespace]`
        )
        .containsText(prodScanMatchingData.name)
        .containsText(prodScanMatchingData.package_name);

      assert
        .dom(
          `[data-test-table-row-id="${row}"] [data-test-table-row-prod-version]`
        )
        .hasText(prodScanMatchingData.production_version);

      assert
        .dom(
          `[data-test-table-row-id="${row}"] [data-test-table-row-platform=${prodScanMatchingData.platform}]`
        )
        .exists();

      assert
        .dom(`[data-test-table-row-id="${row}"] [data-test-table-row-version]`)
        .hasText(prodScanMatchingData.version);

      assert
        .dom(`[data-test-table-row-id="${row}"] [data-test-table-row-status]`)
        .hasText(prodScanMatchingData.status.split('-').join(' '));
    }
  });

  test('The table data items count should change if the page limit changes', async function (assert) {
    const prodScanRoute = this.owner.lookup(
      'route:authenticated/production-scan'
    );

    this.set('offset', 1);
    this.set('limit', 10);
    this.set('totalProdScanData', prodScanRoute.createProdScanTableData(31));
    this.set('startIdx', (this.offset - 1) * this.limit);
    this.set('endIdx', this.startIdx + this.limit);
    this.set('prodScanTableData', {
      results: this.totalProdScanData.slice(this.startIdx, this.endIdx),
      count: 31,
    });
    this.set('updateTableData', (args) => {
      // If this block is executed the expected "args" value is in the format:
      // {selectedItemsPerPage: NUMBER, offset: NUMBER}

      const { limit, offset } = args;
      this.set('limit', limit);
      this.set('offset', offset);
      this.set('startIdx', (offset - 1) * limit);
      this.set('endIdx', this.startIdx + limit);
      this.set('prodScanTableData', {
        results: this.totalProdScanData.slice(this.startIdx, this.endIdx),
        count: 31,
      });
    });
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    /**
     * NOTE:
     * The default values of the select options in the pagination component are [5, 10, 20, 30, 40]
     * Pagination component is used in the production scan table
     * The 'updateTableData' callback is triggered in the production scan table component class
       any time the select options value changes in the pagination component
     * 
     */
    await render(
      hbs`
      <ProductionScan::Table 
        @settings={{this.settings}} 
        @prodScanTableData={{this.prodScanTableData}} 
        @updateTableData={{this.updateTableData}}
        @defaultLimit={{this.limit}}
        @offset={{this.offset}}
        @settings={{this.settings}}
      />`
    );
    assert.dom(`[data-test-production-scan-table]`).exists();
    assert.dom(`[data-test-table-header-container]`).exists();
    assert.dom(`[data-test-pagination-container]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-table-header]`).length,
      5,
      'Should have five (5) table headers'
    );

    assert.strictEqual(
      this.element.querySelectorAll('[data-test-table-row]').length,
      this.limit,
      `Should have ${this.limit} scanned projects - [data-test-table-row]`
    );

    // The default values of select options are [5, 10, 20, 30, 40]
    const selectOptions = findAll(`[data-test-pagination-select-option]`);
    let newSelectValue = selectOptions[3].value;

    // Triggers the 'updateTableData' handler
    await fillIn(`[data-test-pagination-select]`, newSelectValue);

    assert.ok(
      this.element.querySelectorAll('[data-test-table-row]').length <=
        this.limit,
      `Should have less than or equal to ${this.limit} scanned projects - [data-test-table-row]`
    );

    // The default values of select options are [5, 10, 20, 30, 40]
    newSelectValue = selectOptions[2].value;

    // Triggers the 'updateTableData' handler
    await fillIn(`[data-test-pagination-select]`, newSelectValue);

    assert.ok(
      this.element.querySelectorAll('[data-test-table-row]').length <=
        this.limit,
      `Should have less than or equal to ${this.limit} scanned projects - [data-test-table-row]`
    );
    // The default values of select options are [5, 10, 20, 30, 40]
    newSelectValue = selectOptions[4].value;

    // Triggers the 'updateTableData' handler
    await fillIn(`[data-test-pagination-select]`, newSelectValue);

    assert.ok(
      this.element.querySelectorAll('[data-test-table-row]').length <=
        this.limit,
      `Should have less than or equal to ${this.limit} scanned projects - [data-test-table-row]`
    );
  });
});
