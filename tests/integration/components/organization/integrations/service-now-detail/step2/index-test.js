import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

// Static enum-derived values that mirror the component's snTableItems getter
const SN_TABLE_ITEMS = [
  { label: 'sn_vul_app_vulnerable_item', value: 0 },
  { label: 'sn_vul_vulnerable_item', value: 1 },
  { label: 'Custom', value: 2 },
];

// Static values that mirror the component's appknoxSourceKeyOptions getter
const APPKNOX_KEYS = [
  { label: 'vulnerability_name', value: 'vulnerability_name' },
  { label: 'risk', value: 'risk' },
];

const TEMPLATE = hbs`
  <Organization::Integrations::ServiceNowDetail::Step2
    @snTableItems={{this.snTableItems}}
    @selectedSNTable={{this.selectedSNTable}}
    @onSetSNTable={{this.onSetSNTable}}
    @isCustomTable={{this.isCustomTable}}
    @selectedCustomTable={{this.selectedCustomTable}}
    @customTableSuggestions={{this.customTableSuggestions}}
    @customTableSearch={{this.customTableSearch}}
    @onCustomTableSearch={{this.onCustomTableSearch}}
    @onCustomTableSelect={{this.onCustomTableSelect}}
    @onClearCustomTable={{this.onClearCustomTable}}
    @filterAlwaysTrue={{this.filterAlwaysTrue}}
    @getCustomTableLabel={{this.getCustomTableLabel}}
    @searchCustomTablesIsRunning={{this.searchCustomTablesIsRunning}}
    @fetchTableColumnsIsRunning={{this.fetchTableColumnsIsRunning}}
    @appknoxSourceKeyOptions={{this.appknoxSourceKeyOptions}}
    @availableColumnsFor={{this.availableColumnsFor}}
    @fieldMapping={{this.fieldMapping}}
    @onUpdateMapping={{this.onUpdateMapping}}
  />
`;

const selectors = {
  tableSelect: '[data-test-orgIntegrations-serviceNowDetail-tableSelect]',
  customTableSearch:
    '[data-test-orgIntegrations-serviceNowDetail-customTableSearch]',
  selectedTableInput:
    '[data-test-orgIntegrations-serviceNowDetail-selectedTableInput]',
  clearTableBtn: '[data-test-orgIntegrations-serviceNowDetail-clearTableBtn]',
  mappingRow: '[data-test-orgIntegrations-serviceNowDetail-mappingRow]',
  mappingColumn: '[data-test-orgIntegrations-serviceNowDetail-mappingColumn]',
};

module(
  'Integration | Component | organization/integrations/service-now-detail/step2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        snTableItems: SN_TABLE_ITEMS,
        selectedSNTable: null,
        isCustomTable: false,
        selectedCustomTable: null,
        customTableSuggestions: [],
        customTableSearch: '',
        searchCustomTablesIsRunning: false,
        fetchTableColumnsIsRunning: false,
        appknoxSourceKeyOptions: APPKNOX_KEYS,
        availableColumnsFor: {},
        fieldMapping: {},
        onSetSNTable: () => {},
        onCustomTableSearch: () => {},
        onCustomTableSelect: () => {},
        onClearCustomTable: () => {},
        filterAlwaysTrue: () => true,
        getCustomTableLabel: (item) =>
          typeof item === 'string' ? item : item.label,
        onUpdateMapping: () => {},
      });
    });

    test('it renders table selector with no custom table visible', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.tableSelect).exists();

      assert.dom().containsText(t('serviceNow.serviceNowTable'));

      assert.dom(selectors.customTableSearch).doesNotExist();

      assert.dom(selectors.mappingRow).doesNotExist();
    });

    test('it shows autocomplete search when Custom table option is selected but no table chosen yet', async function (assert) {
      this.set('selectedSNTable', SN_TABLE_ITEMS[2]);
      this.set('isCustomTable', true);

      await render(TEMPLATE);

      assert.dom(selectors.customTableSearch).exists();

      assert.dom(selectors.selectedTableInput).doesNotExist();
    });

    test('it shows selected table chip and AkTable field mapping when a custom table is chosen', async function (assert) {
      const customTable = this.server.create('sn-custom-table');
      const columns = this.server.createList('sn-column', 2);

      const selectedCustomTable = {
        label: customTable.label,
        value: customTable.value,
      };
      const snColumns = columns.map(({ label, value, type }) => ({
        label,
        value,
        type,
      }));

      this.setProperties({
        selectedSNTable: SN_TABLE_ITEMS[2],
        isCustomTable: true,
        selectedCustomTable,
        availableColumnsFor: {
          vulnerability_name: snColumns,
          risk: snColumns,
        },
      });

      await render(TEMPLATE);

      assert.dom(selectors.selectedTableInput).exists();

      assert.dom(selectors.clearTableBtn).exists();

      assert.dom(selectors.mappingRow).exists({ count: APPKNOX_KEYS.length });

      assert
        .dom(selectors.mappingColumn)
        .exists({ count: APPKNOX_KEYS.length });

      assert.dom().containsText(t('serviceNow.columnMapping'));

      assert.dom().containsText(t('serviceNow.appknoxField'));

      assert.dom().containsText(t('serviceNow.snColumn'));
    });
  }
);
