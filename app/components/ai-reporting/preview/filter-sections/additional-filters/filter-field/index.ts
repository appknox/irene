import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type {
  PreviewFilterField,
  AdditionalFilter,
} from 'irene/models/report-request';

import ENUMS from 'irene/enums';

interface AiReportingPreviewFilterSectionsAdditionalFiltersFilterFieldSignature {
  Args: {
    sectionId: string;
    field: PreviewFilterField;
    operators: string[];
    additionalFilters: AdditionalFilter[];

    onAddUpdateFilter: (
      id: string,
      detail: AdditionalFilter['filter_details']
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsAdditionalFiltersFilterFieldComponent extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersFilterFieldSignature> {
  @tracked operator = (this.fieldDetails?.operator ||
    this.operators[0]) as string;

  get filterDetails() {
    return this.args.additionalFilters.find((f) => f.id === this.args.sectionId)
      ?.filter_details;
  }

  get fieldDetails() {
    return this.filterDetails?.[this.args.field.field];
  }

  get currentValue() {
    return this.fieldDetails?.value ?? null;
  }

  get operators() {
    return this.args.operators;
  }

  get valueComponent() {
    if (this.args.field.choices) {
      return 'ai-reporting/preview/filter-sections/additional-filters/choice-type';
    }

    switch (this.args.field.type) {
      case ENUMS.AI_REPORTING_FIELD_TYPE.STRING:
      case ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER:
      case ENUMS.AI_REPORTING_FIELD_TYPE.NUMBER:
      case ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN:
      case ENUMS.AI_REPORTING_FIELD_TYPE.DATETIME:
        return 'ai-reporting/preview/filter-sections/additional-filters/text-type';

      default:
        return 'ai-reporting/preview/filter-sections/additional-filters/text-type';
    }
  }

  @action
  isEmpty(value: unknown) {
    return value === undefined || (typeof value === 'string' && !value.trim());
  }

  @action
  handleOperatorChange(operator: string) {
    this.operator = operator;

    this.handleAddUpdateFilter(this.operator, this.currentValue);
  }

  @action
  handleAddUpdateFilter(
    operator: string,
    value: string | number | boolean | null
  ) {
    if (this.isEmpty(value)) {
      return;
    }

    this.args.onAddUpdateFilter(this.args.sectionId, {
      [this.args.field.field]: {
        operator,
        value,
      },
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::AdditionalFilters::FilterField': typeof AiReportingPreviewFilterSectionsAdditionalFiltersFilterFieldComponent;
  }
}
