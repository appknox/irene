import Component from '@glimmer/component';
import { action } from '@ember/object';

import ENUMS from 'irene/enums';

import type {
  AdditionalFilterFilterDetailsExpressionValues,
  PreviewFilterField,
} from 'irene/models/report-request';

import styles from './index.scss';

type ChoiceValueType = string | number | boolean | null;

interface AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeSignature {
  Args: {
    field: PreviewFilterField;
    operator: string;
    isErrored: boolean;
    currentValue:
      | AdditionalFilterFilterDetailsExpressionValues
      | AdditionalFilterFilterDetailsExpressionValues[];

    onAddUpdateFilter: (
      operator: string,
      value:
        | AdditionalFilterFilterDetailsExpressionValues
        | AdditionalFilterFilterDetailsExpressionValues[]
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeComponent extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeSignature> {
  get field() {
    return this.args.field;
  }

  get isMultiple() {
    return [
      ENUMS.AI_REPORTING_FILTER_OPERATOR.IN,
      ENUMS.AI_REPORTING_FILTER_OPERATOR.NOT_IN,
    ].includes(this.args.operator);
  }

  get currentValue() {
    return this.args.currentValue;
  }

  get choices() {
    return this.field.choices?.map((c) => String(c[1])) ?? [];
  }

  get label() {
    return this.field.label || this.field.filter_key;
  }

  get selectedChoice() {
    const selectedChoices = this.currentValue as
      | ChoiceValueType
      | ChoiceValueType[];

    return this.isMultiple && Array.isArray(selectedChoices)
      ? this.choices?.filter((c) => selectedChoices?.includes(c))
      : this.choices?.find((c) => c == selectedChoices);
  }

  get dropdownClass() {
    return styles['choice-type-dropdown'];
  }

  @action
  getOptionLabel(opt: ChoiceValueType) {
    return this.field.choices?.find((c) => c[1] == opt)?.[0];
  }

  @action
  handleChoiceSelection(selection: ChoiceValueType | ChoiceValueType[]) {
    this.args.onAddUpdateFilter(this.args.operator, selection);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::AdditionalFilters::ChoiceType': typeof AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeComponent;
    'ai-reporting/preview/filter-sections/additional-filters/choice-type': typeof AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeComponent;
  }
}
