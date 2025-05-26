import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';

import {
  assertAkSelectTriggerExists,
  chooseAkSelectOption,
  assertAkSelectOptionSelected,
} from 'irene/tests/helpers/mirage-utils';

import * as AI_GENERATE_REPORT_UTILS from 'irene/tests/helpers/ai-generate-report-utils';

module(
  'Integration | Component | ai-reporting/preview/filter-sections/filter-group/item',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      // Generate test data
      const testData = AI_GENERATE_REPORT_UTILS.generateTestData(1);

      // Mock filter details
      const mockFilterDetails = testData.filter_details[1];
      const mockFilter = mockFilterDetails.fields[0];

      // Mock props
      this.setProperties({
        sectionId: 'test-section',
        filterDetails: mockFilterDetails,
        filterObj: { filter: mockFilter },
        availableFiltersFields: mockFilterDetails.fields,
        filterIdx: 0,
        mappedAdditionalFilters: {},
        selectedFilters: [{ filter: mockFilter }],
        erroredFields: {},

        // Methods
        updateSelectedFilters: (filters) => {
          this.set('selectedFilters', filters);
        },
        clearErrorField: () => {},
        updateMappedAdditionalFilters: (filter) => {
          this.set('mappedAdditionalFilters', filter);
        },
      });
    });

    test('it renders correctly for first filter item', async function (assert) {
      assert.expect(5);

      await render(hbs`
        <AiReporting::Preview::FilterSections::FilterGroup::Item
          @sectionId={{this.sectionId}}
          @filterDetails={{this.filterDetails}}
          @filterObj={{this.filterObj}}
          @availableFiltersFields={{this.availableFiltersFields}}
          @filterIdx={{this.filterIdx}}
          @mappedAdditionalFilters={{this.mappedAdditionalFilters}}
          @selectedFilters={{this.selectedFilters}}
          @erroredFields={{this.erroredFields}}
          @updateSelectedFilters={{this.updateSelectedFilters}}
          @clearErrorField={{this.clearErrorField}}
          @updateMappedAdditionalFilters={{this.updateMappedAdditionalFilters}}
        />
      `);

      // Check that the component renders
      assert
        .dom(
          `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItem="${this.sectionId}-${this.filterIdx}"]`
        )
        .exists();

      // For the first filter, check that "WHERE" is displayed instead of union operator
      assert
        .dom(
          '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItemIndicator]'
        )
        .exists()
        .hasText(t('reportModule.advancedFilters.where'));

      // Union operator select should not exist for first filter
      assert
        .dom(
          '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItem-unionOperatorSelect]'
        )
        .doesNotExist();

      // Check that field select exists with correct class
      assertAkSelectTriggerExists(
        assert,
        `.${this.filterObj.filter.field}-filter-group-item-field-select`
      );
    });

    test('it renders correctly for non-first filter item', async function (assert) {
      assert.expect(3);

      // Set filterIdx to 1 to test non-first filter rendering
      this.set('filterObj', this.selectedFilters[0]);
      this.set('filterIdx', 1);

      await render(hbs`
        <AiReporting::Preview::FilterSections::FilterGroup::Item
          @sectionId={{this.sectionId}}
          @filterDetails={{this.filterDetails}}
          @filterObj={{this.filterObj}}
          @availableFiltersFields={{this.availableFiltersFields}}
          @filterIdx={{this.filterIdx}}
          @mappedAdditionalFilters={{this.mappedAdditionalFilters}}
          @selectedFilters={{this.selectedFilters}}
          @erroredFields={{this.erroredFields}}
          @updateSelectedFilters={{this.updateSelectedFilters}}
          @clearErrorField={{this.clearErrorField}}
          @updateMappedAdditionalFilters={{this.updateMappedAdditionalFilters}}
        />
      `);

      // Check that union operator select exists for non-first filter
      const unionOperatorSelect = `.${this.filterObj.filter.field}-filter-group-item-union-operator-select`;

      assertAkSelectTriggerExists(assert, unionOperatorSelect);

      assertAkSelectOptionSelected({
        assert,
        selector: unionOperatorSelect,
        label: 'AND',
      });

      // WHERE indicator should not exist for non-first filter
      assert
        .dom(
          '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItemIndicator]'
        )
        .doesNotExist();
    });

    test('it adds in-operator class when filter with string/float type has IN operator', async function (assert) {
      assert.expect(1);

      // Create a string filter with IN operator
      const stringField = this.availableFiltersFields.find(
        (f) => f.type === 'string'
      );

      this.setProperties({
        filterObj: { filter: stringField },
        mappedAdditionalFilters: {
          [stringField.field]: {
            operator: ENUMS.AI_REPORTING_FILTER_OPERATOR.IN,
            value: null,
          },
        },
      });

      await render(hbs`
        <AiReporting::Preview::FilterSections::FilterGroup::Item
          @sectionId={{this.sectionId}}
          @filterDetails={{this.filterDetails}}
          @filterObj={{this.filterObj}}
          @availableFiltersFields={{this.availableFiltersFields}}
          @filterIdx={{this.filterIdx}}
          @mappedAdditionalFilters={{this.mappedAdditionalFilters}}
          @selectedFilters={{this.selectedFilters}}
          @erroredFields={{this.erroredFields}}
          @updateSelectedFilters={{this.updateSelectedFilters}}
          @clearErrorField={{this.clearErrorField}}
          @updateMappedAdditionalFilters={{this.updateMappedAdditionalFilters}}
        />
      `);

      // Check that in-operator class is applied
      assert
        .dom(
          `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItem="${this.sectionId}-${this.filterIdx}"]`
        )
        .hasClass(/in-operator/);
    });

    test('it removes a filter when remove button is clicked', async function (assert) {
      assert.expect(3);

      // Override the updateSelectedFilters method to assert it gets called correctly
      this.set('updateSelectedFilters', (filters) => {
        assert.strictEqual(
          filters.length,
          this.selectedFilters.length - 1,
          'Filter was removed from the array'
        );

        this.set('selectedFilters', filters);
      });

      // Override the updateMappedAdditionalFilters method to assert it gets called correctly
      this.set('updateMappedAdditionalFilters', (mappedFilters) => {
        assert.deepEqual(
          mappedFilters,
          {},
          'Mapped additional filters were cleared'
        );

        this.set('mappedAdditionalFilters', mappedFilters);
      });

      await render(hbs`
        <AiReporting::Preview::FilterSections::FilterGroup::Item
          @sectionId={{this.sectionId}}
          @filterDetails={{this.filterDetails}}
          @filterObj={{this.filterObj}}
          @availableFiltersFields={{this.availableFiltersFields}}
          @filterIdx={{this.filterIdx}}
          @mappedAdditionalFilters={{this.mappedAdditionalFilters}}
          @selectedFilters={{this.selectedFilters}}
          @erroredFields={{this.erroredFields}}
          @updateSelectedFilters={{this.updateSelectedFilters}}
          @clearErrorField={{this.clearErrorField}}
          @updateMappedAdditionalFilters={{this.updateMappedAdditionalFilters}}
        />
      `);

      // Check that remove button exists
      assert
        .dom(
          '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItem-removeBtn]'
        )
        .exists();

      // Click the remove button
      await click(
        '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItem-removeBtn]'
      );
    });

    test('it replaces a filter when a new filter is selected', async function (assert) {
      assert.expect(3);

      // Get a different filter to select
      const newFilter = this.availableFiltersFields[1];

      // Override the updateSelectedFilters method to assert it gets called correctly
      this.set('updateSelectedFilters', (filters) => {
        assert.strictEqual(
          filters[0].filter.field,
          newFilter.field,
          'Filter was replaced with the selected filter'
        );

        this.set('filterObj', { filter: newFilter });
        this.set('selectedFilters', filters);
      });

      await render(hbs`
        <AiReporting::Preview::FilterSections::FilterGroup::Item
          @sectionId={{this.sectionId}}
          @filterDetails={{this.filterDetails}}
          @filterObj={{this.filterObj}}
          @availableFiltersFields={{this.availableFiltersFields}}
          @filterIdx={{this.filterIdx}}
          @mappedAdditionalFilters={{this.mappedAdditionalFilters}}
          @selectedFilters={{this.selectedFilters}}
          @erroredFields={{this.erroredFields}}
          @updateSelectedFilters={{this.updateSelectedFilters}}
          @clearErrorField={{this.clearErrorField}}
          @updateMappedAdditionalFilters={{this.updateMappedAdditionalFilters}}
        />
      `);

      // Check field select exists
      const fieldSelect = `.${this.filterObj.filter.field}-filter-group-item-field-select`;

      // Check field select exists
      assertAkSelectTriggerExists(assert, fieldSelect);

      // Select a new filter
      await chooseAkSelectOption({
        selectTriggerClass: fieldSelect,
        labelToSelect: newFilter.label,
      });

      // Check filter field operator has changed
      const newFilterOperatorSelect = `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-filterOperatorSelectKey="${newFilter.field}"]`;

      assertAkSelectTriggerExists(assert, newFilterOperatorSelect);
    });
  }
);
