import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import ENUMS from 'irene/enums';

import type {
  AdditionalFilterFilterDetailsExpressionValues,
  PreviewFilterField,
} from 'irene/models/report-request';

interface AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeSignature {
  Args: {
    field: PreviewFilterField;
    operator: string;
    isErrored: boolean;
    currentValue:
      | AdditionalFilterFilterDetailsExpressionValues
      | AdditionalFilterFilterDetailsExpressionValues[];

    onAddUpdateFilter: (
      operator: string,
      value: AdditionalFilterFilterDetailsExpressionValues
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeComponent extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeSignature> {
  @tracked value = this.currentValue;

  get currentValue() {
    const value = (this.args.currentValue || '') as string | string[];

    return Array.isArray(value) ? value.join(',') : value;
  }

  get isInOperator() {
    return [
      ENUMS.AI_REPORTING_FILTER_OPERATOR.IN,
      ENUMS.AI_REPORTING_FILTER_OPERATOR.NOT_IN,
    ].includes(this.args.operator);
  }

  @action
  handleValueChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;

    const valueToUpdate =
      this.isInOperator && value.length > 0 ? value.split(',') : value;

    this.args.onAddUpdateFilter(this.args.operator, valueToUpdate);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::AdditionalFilters::TextType': typeof AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeComponent;
    'ai-reporting/preview/filter-sections/additional-filters/text-type': typeof AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeComponent;
  }
}
