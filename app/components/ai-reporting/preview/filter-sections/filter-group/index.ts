import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { aiReportFilterOperators } from 'irene/helpers/ai-report-filter-operators';

import type {
  PreviewFilterProps,
  MappedAdditionalFilters,
} from 'irene/components/ai-reporting/preview/advance-filter-drawer';

import type {
  AdditionalFilter,
  AdditionalFilterErroredFieldProp,
  PreviewFilterDetails,
  PreviewFilterField,
} from 'irene/models/ai-reporting/report-request';

interface AiReportingPreviewFilterSectionsFilterGroupSignature {
  Args: {
    sectionId: string;
    erroredFields: Record<string, AdditionalFilterErroredFieldProp>;
    filterDetails: PreviewFilterDetails;
    additionalFilters: AdditionalFilter[];
    allSelectedFilters: Record<string, PreviewFilterProps[]>;
    allMappedAdditionalFilters: MappedAdditionalFilters;

    // Methods
    clearErrorField: (field: string, sectionId: string) => void;

    updateSelectedFilters: (
      sectionId: string,
      filters: PreviewFilterProps[]
    ) => void;

    updateMappedAdditionalFilters: (
      sectionId: string,
      mappedAdditionalFilters: AdditionalFilter['filter_details']
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsFilterGroup extends Component<AiReportingPreviewFilterSectionsFilterGroupSignature> {
  @tracked sectionContainer: HTMLElement | null = null;

  // Filter groups with different names
  filterGroupNameMap: Record<string, string> = {
    Analysis: 'Vulnerability',
    OrganizationMember: 'User',
  };

  get selectedFilters() {
    return this.args.allSelectedFilters[this.sectionId] ?? [];
  }

  get filterGroupName() {
    const filterName = this.filterDetails.model_name;

    return this.filterGroupNameMap[filterName] ?? filterName;
  }

  get mappedAdditionalFilters() {
    return this.args.allMappedAdditionalFilters[this.sectionId] ?? {};
  }

  get noSelectedFilters() {
    return this.selectedFilters.length === 0;
  }

  get hasSelectedFilters() {
    return this.selectedFilters.length > 0;
  }

  get filterDetails() {
    return this.args.filterDetails;
  }

  get filterFields() {
    return this.filterDetails.fields;
  }

  get availableFiltersFields() {
    return this.filterFields.filter(
      (field) => !this.selectedFilters.some((filter) => filter.filter === field)
    );
  }

  get preventFilterAddition() {
    return this.availableFiltersFields.length === 0;
  }

  get sectionId() {
    return this.args.sectionId;
  }

  @action
  noop() {}

  @action
  initFilterGroup(element: HTMLElement) {
    this.sectionContainer = element;
  }

  // Update the selected filters for the filter group
  @action
  updateSelectedFilters(filters: PreviewFilterProps[]) {
    this.args.updateSelectedFilters(this.sectionId, filters);
  }

  // Update the mapped additional filters for the filter group
  @action
  updateMappedAdditionalFilters(
    mappedAdditionalFilters: AdditionalFilter['filter_details']
  ) {
    this.args.updateMappedAdditionalFilters(
      this.sectionId,
      mappedAdditionalFilters
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
   * Add a new filter to the filter group based on the available fields
   * @returns void
   */
  @action
  addNewFilter() {
    const newFieldToAdd = this.availableFiltersFields[0];
    const existingSelectedFilters = [...this.selectedFilters];

    if (newFieldToAdd) {
      this.updateSelectedFilters([
        ...existingSelectedFilters,
        { filter: newFieldToAdd },
      ]);

      // Map the new filter with the default operator
      const defaultOperator = aiReportFilterOperators([newFieldToAdd])[0];
      const fieldKey = this.getFilterFieldKey(newFieldToAdd);

      this.updateMappedAdditionalFilters({
        ...this.mappedAdditionalFilters,
        [fieldKey]: {
          filterMetaInfo: newFieldToAdd,
          operator: defaultOperator as string,
          value: null,
        },
      });
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::FilterGroup': typeof AiReportingPreviewFilterSectionsFilterGroup;
  }
}
