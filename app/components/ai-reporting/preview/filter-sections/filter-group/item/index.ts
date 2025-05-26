import Component from '@glimmer/component';
import { action } from '@ember/object';

import { aiReportFilterOperators } from 'irene/helpers/ai-report-filter-operators';
import ENUMS from 'irene/enums';

import type { PreviewFilterProps } from 'irene/components/ai-reporting/preview/advance-filter-drawer';

import {
  PreviewFilterField,
  PreviewFilterDetails,
  AdditionalFilterErroredFieldProp,
  AdditionalFilter,
  AdditionalFilterFilterDetailsExpression,
} from 'irene/models/ai-reporting/report-request';

import styles from './index.scss';

interface AiReportingPreviewFilterSectionsFilterGroupItemSignature {
  Args: {
    sectionId: string;
    filterDetails: PreviewFilterDetails;
    filterObj: PreviewFilterProps;
    availableFiltersFields: PreviewFilterField[];
    filterIdx: number;
    mappedAdditionalFilters: AdditionalFilter['filter_details'];
    selectedFilters: PreviewFilterProps[];
    erroredFields: Record<string, AdditionalFilterErroredFieldProp>;

    // Methods
    updateSelectedFilters: (filters: PreviewFilterProps[]) => void;
    clearErrorField: (field: string, sectionId: string) => void;
    updateMappedAdditionalFilters: (
      filter: AdditionalFilter['filter_details']
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsFilterGroupItem extends Component<AiReportingPreviewFilterSectionsFilterGroupItemSignature> {
  get filterDetails() {
    return this.args.filterDetails;
  }

  get filterFields() {
    return this.filterDetails.fields;
  }

  get mappedAdditionalFilters() {
    return this.args.mappedAdditionalFilters;
  }

  get unionOperators() {
    return ['AND'];
  }

  get selectedUnionOperator() {
    return this.unionOperators[0];
  }

  get selectedFilters() {
    return this.args.selectedFilters;
  }

  get sectionId() {
    return this.args.sectionId;
  }

  get filterFieldsDropdownClass() {
    return styles['filter-fields-dropdown'];
  }

  @action
  noop() {}

  /**
   * Check if the in operator is selected for a filter
   * @param filter - The filter to check
   * @returns True if the in operator is selected, false otherwise
   */
  @action
  getInOperatorSelected(filter: PreviewFilterProps['filter']) {
    const filterKey = this.getFilterFieldKey(filter);
    const filterType = String(filter?.type);

    // FIELD TYPES
    const { STRING, FLOAT } = ENUMS.AI_REPORTING_FIELD_TYPE;
    const inOperatorRequiringStyling = [STRING, FLOAT].includes(filterType);

    // OPERATORS
    const { IN, NOT_IN } = ENUMS.AI_REPORTING_FILTER_OPERATOR;

    return (
      inOperatorRequiringStyling &&
      [IN, NOT_IN].includes(
        String(this.mappedAdditionalFilters[filterKey]?.operator)
      )
    );
  }

  /**
   * Get the filter field key for a filter field
   * @param field - The filter field to get the key for
   * @returns The filter field key
   */
  @action
  getFilterFieldKey(field: PreviewFilterField) {
    return field.filter_key ?? field.field;
  }

  /**
   * Update a filter at a specific index
   * @param idx - The index of the filter to update
   * @returns A function that updates the filter at the specific index
   */
  @action
  onFilterUpdate(idx: number) {
    return (id: string, detail: AdditionalFilter['filter_details']) => {
      const targetedFilter = this.selectedFilters[idx];

      if (!targetedFilter) {
        return;
      }

      // Update the mapped additional filters
      const fieldKeyToUpdate = this.getFilterFieldKey(targetedFilter.filter);
      const mappedFilter = detail[fieldKeyToUpdate];

      this.args.updateMappedAdditionalFilters({
        ...this.mappedAdditionalFilters,
        [fieldKeyToUpdate]:
          mappedFilter as AdditionalFilterFilterDetailsExpression,
      });

      // Clear the error field for the filter
      this.args.clearErrorField(fieldKeyToUpdate, id);
    };
  }

  /**
   * Replace a filter at a specific index
   * @param currFilterIdx - The index of the filter to replace
   * @returns A function that replaces the filter at the specific index
   */
  @action
  replaceFilterAtIndex(currFilterIdx: number) {
    return (newFilter: PreviewFilterField) => {
      const filterToReplace = this.selectedFilters[currFilterIdx];

      if (filterToReplace) {
        this.args.updateSelectedFilters([
          ...this.selectedFilters.slice(0, currFilterIdx),
          { filter: newFilter },
          ...this.selectedFilters.slice(currFilterIdx + 1),
        ]);

        // Delete the old filter from the mapped additional filters
        const oldMappedFilters = { ...this.mappedAdditionalFilters };
        const fieldKeyToDelete = this.getFilterFieldKey(filterToReplace.filter);

        delete oldMappedFilters[fieldKeyToDelete];

        // Add the new filter to the mapped additional filters
        const newFilterFieldKey = this.getFilterFieldKey(newFilter);
        const defaultOperator = aiReportFilterOperators([newFilter])[0] ?? '';

        this.args.updateMappedAdditionalFilters({
          ...oldMappedFilters,
          [newFilterFieldKey]: {
            filterMetaInfo: newFilter,
            operator: defaultOperator,
            value: null,
          },
        });

        // Clear the error field for the filter
        this.args.clearErrorField(fieldKeyToDelete, this.sectionId);
      }
    };
  }

  /**
   * Remove a filter at a specific index
   * @param idx - The index of the filter to remove
   */
  @action
  removeFilterAtIndex(idx: number) {
    const filterToDelete = this.selectedFilters[idx];

    if (filterToDelete) {
      // Delete the filter from the selected filters
      const updatedFilters = this.selectedFilters.filter(
        (_, index) => index !== idx
      );

      this.args.updateSelectedFilters(updatedFilters);

      // Delete the old filter from the mapped additional filters
      const oldMappedFilters = { ...this.mappedAdditionalFilters };
      const fieldToDelete = this.getFilterFieldKey(filterToDelete.filter);

      delete oldMappedFilters[fieldToDelete];

      this.args.updateMappedAdditionalFilters(oldMappedFilters);

      // Clear the error field for the filter
      this.args.clearErrorField(fieldToDelete, this.sectionId);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::FilterGroup::Item': typeof AiReportingPreviewFilterSectionsFilterGroupItem;
  }
}
