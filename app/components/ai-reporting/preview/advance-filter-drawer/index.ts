import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import ENUMS from 'irene/enums';

import type {
  PreviewFilterField,
  AdditionalFilter,
  AdditionalFilterErroredFieldProp,
  AdditionalFilterFilterDetailsExpression,
  PreviewFilterDetails,
} from 'irene/models/ai-reporting/report-request';

export interface PreviewFilterProps {
  filter: PreviewFilterField;
}

export type MappedAdditionalFilters = Record<
  string,
  AdditionalFilter['filter_details']
>;

interface AiReportingPreviewAdvanceFilterDrawerSignature {
  Args: {
    filterDetails: PreviewFilterDetails[];
    additionalFilters: AdditionalFilter[];
    onClose: () => void;
    onApply: (additionalFilters: AdditionalFilter[]) => void;
  };
}

export default class AiReportingPreviewAdvanceFilterDrawer extends Component<AiReportingPreviewAdvanceFilterDrawerSignature> {
  // Selected filters keep track of the selected filters for each filter group
  // Mapped additional filters keep track of the selected filter values and their expressions.
  // The separation is important to prevent rerendering of the selected filters list on every change of the applied filters operation or values.
  @tracked selectedFilters: Record<string, PreviewFilterProps[]> = {};
  @tracked mappedAdditionalFilters: MappedAdditionalFilters = {};

  @tracked additionalFilters: AdditionalFilter[] = [];
  @tracked erroredFields: Record<string, AdditionalFilterErroredFieldProp> = {};

  constructor(
    owner: unknown,
    args: AiReportingPreviewAdvanceFilterDrawerSignature['Args']
  ) {
    super(owner, args);

    this.additionalFilters = this.defaultAdditionalFilters;

    // Recompute the selected and mapped filters from default/pre-existing filters
    const defaultFilters = this.computeDefaultSelectedAndMappedFilters();

    this.selectedFilters = defaultFilters.selectedFilters;
    this.mappedAdditionalFilters = defaultFilters.mappedFilters;
  }

  get filterFields() {
    return this.args.filterDetails.map((fd) => fd.fields).flat();
  }

  get filterDetails() {
    return this.args.filterDetails;
  }

  get defaultAdditionalFilters() {
    return this.args.additionalFilters;
  }

  @action
  clearAllFilters() {
    if (this.additionalFilters.length > 0) {
      this.erroredFields = {};
      this.selectedFilters = {};
      this.mappedAdditionalFilters = {};
      this.additionalFilters = [];
    }
  }

  @action
  handleClose() {
    this.erroredFields = {};
    this.additionalFilters = this.defaultAdditionalFilters;

    this.args.onClose();
  }

  @action
  applyAndClose() {
    const hasErrors = this.checkAllFiltersForErrors();

    if (hasErrors) {
      return;
    }

    const filters = this.stripFilterMetaInfo();

    this.args.onApply(filters);
    this.args.onClose();
  }

  @action checkObjHasValues(obj: Record<string, unknown>) {
    return Object.keys(obj).length > 0;
  }

  // Add or update the selected filters for a filter group
  @action
  updateSelectedFilters(sectionId: string, filters: PreviewFilterProps[]) {
    const currSelectedFilters = { ...this.selectedFilters };
    currSelectedFilters[sectionId] = filters;

    this.selectedFilters = currSelectedFilters;
  }

  // Add or update the mapped additional filters for a filter group
  @action
  updateMappedAdditionalFilters(
    sectionId: string,
    mappedAdditionalFilters: AdditionalFilter['filter_details']
  ) {
    const currMappedAdditionalFilters = { ...this.mappedAdditionalFilters };
    currMappedAdditionalFilters[sectionId] = mappedAdditionalFilters;

    this.mappedAdditionalFilters = currMappedAdditionalFilters;
    this.updateAdditionalFilters(sectionId, mappedAdditionalFilters);
  }

  // Remove filterMetaInfo used in error checking (see fn checkAllFiltersForErrors)
  @action
  stripFilterMetaInfo() {
    const filters = this.additionalFilters
      .map((f) => ({
        ...f,
        filter_details: Object.fromEntries(
          Object.entries(f.filter_details).map(([key, { operator, value }]) => [
            key,
            { operator, value },
          ])
        ) as Record<
          string,
          Omit<AdditionalFilterFilterDetailsExpression, 'filterMetaInfo'>
        >,
      }))
      .filter((f) => this.checkObjHasValues(f.filter_details));

    return filters;
  }

  // Check if any filters have errors
  @action
  checkAllFiltersForErrors() {
    const currErroredFields = { ...this.erroredFields };

    this.additionalFilters.forEach((f) => {
      const previewDetails = f.filter_details;

      // Check each filter for errors
      Object.keys(previewDetails).forEach((detail) => {
        const filterExpression = previewDetails[detail];
        const filterMetaInfo = filterExpression?.filterMetaInfo; // Attached when creating new filters in the filter groups
        const operator = filterExpression?.operator;
        const value = filterExpression?.value;

        // Condition for when field is nullable
        const operatorIsExists =
          operator === ENUMS.AI_REPORTING_FILTER_OPERATOR.EXISTS;

        const fieldIsNullable =
          filterMetaInfo?.is_nullable &&
          operator === ENUMS.AI_REPORTING_FILTER_OPERATOR.ISNULL;

        const fieldCanBeNull = operatorIsExists || fieldIsNullable;
        const valueIsEmpty = !fieldCanBeNull && value === null;

        // If operator is IN or NOT IN, check if the value is an array
        const operatorIsIn =
          operator === ENUMS.AI_REPORTING_FILTER_OPERATOR.IN ||
          operator === ENUMS.AI_REPORTING_FILTER_OPERATOR.NOT_IN;

        const arrayValueIsEmpty =
          operatorIsIn && Array.isArray(value) && value.length === 0;

        if (valueIsEmpty || arrayValueIsEmpty) {
          currErroredFields[`${f.id}-${detail}`] = {
            field: valueIsEmpty,
            operator: false,
          };

          this.erroredFields = currErroredFields;
        }
      });
    });

    return this.checkObjHasValues(currErroredFields);
  }

  // Add or update a filter
  @action
  updateAdditionalFilters(
    sectionId: string,
    filters: AdditionalFilter['filter_details']
  ) {
    const filterGroupIdx = this.additionalFilters.findIndex(
      (f) => f.id === sectionId
    );

    // Add the filter group if it doesn't exist
    if (filterGroupIdx === -1) {
      this.additionalFilters = [
        ...this.additionalFilters,
        { id: sectionId, filter_details: filters },
      ];

      return;
    }

    // Update the filter group
    let filterGroupToUpdate = this.additionalFilters[filterGroupIdx];

    if (filterGroupToUpdate) {
      filterGroupToUpdate = {
        ...filterGroupToUpdate,
        filter_details: filters,
      };

      this.additionalFilters[filterGroupIdx] = filterGroupToUpdate;
    }
  }

  // Clear an error field
  @action
  clearErrorField(field: string, sectionId: string) {
    const currErroredFields = { ...this.erroredFields };

    delete currErroredFields[`${sectionId}-${field}`];

    this.erroredFields = { ...currErroredFields };
  }

  // Get the filter field key
  @action
  getFilterFieldKey(field: PreviewFilterField) {
    return field.filter_key ?? field.field;
  }

  /**
   * Recompute the selected and mapped filters from default/pre-existing filters.
   * Useful for persisting filters when the user closes the filter drawer and reopens it.
   *
   * @returns {selectedFilters: Record<string, PreviewFilterProps[]>, mappedFilters: MappedAdditionalFilters}
   */
  @action
  computeDefaultSelectedAndMappedFilters(): {
    selectedFilters: Record<string, PreviewFilterProps[]>;
    mappedFilters: MappedAdditionalFilters;
  } {
    const selectedFilters: Record<string, PreviewFilterProps[]> = {};
    const mappedFilters: MappedAdditionalFilters = {};

    // Iterate over each filter group
    this.filterDetails.forEach((section) => {
      const sId = section.id;

      // Initialize the selected filters and mapped filters for the section
      selectedFilters[sId] = [];
      mappedFilters[sId] = {};

      const preExistingSectionFilters = this.additionalFilters.find(
        (f) => f.id === sId
      );

      // If there are pre-existing filters, map them to the selected filters
      if (preExistingSectionFilters) {
        const preExistingFilters = preExistingSectionFilters.filter_details;

        Object.entries(preExistingFilters).forEach(
          ([exsistingFilterFieldKey, filterExpression]) => {
            const filterFieldToAdd = this.filterFields.find(
              (field) =>
                this.getFilterFieldKey(field) === exsistingFilterFieldKey
            );

            const sectionIdSelectedFilters = selectedFilters[sId] ?? [];
            const sectionIdMappedFilters = mappedFilters[sId] ?? {};

            if (filterFieldToAdd) {
              sectionIdSelectedFilters.push({ filter: filterFieldToAdd });

              // Add filter key to mappedAdditionalFilters
              const filterKey = this.getFilterFieldKey(filterFieldToAdd);

              sectionIdMappedFilters[filterKey] = {
                filterMetaInfo: filterFieldToAdd,
                operator: filterExpression.operator,
                value: filterExpression.value,
              };

              // Add to selectedFilters and mappedFilters
              selectedFilters[sId] = sectionIdSelectedFilters;
              mappedFilters[sId] = sectionIdMappedFilters;
            }
          }
        );
      }
    });

    return { selectedFilters, mappedFilters };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::AdvanceFilterDrawer': typeof AiReportingPreviewAdvanceFilterDrawer;
  }
}
