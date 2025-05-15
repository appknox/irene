import Component from '@glimmer/component';
import { action } from '@ember/object';

import ENUMS from 'irene/enums';

import type {
  AdditionalFilterFilterDetailsExpressionValues,
  PreviewFilterField,
} from 'irene/models/ai-reporting/report-request';

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

  get isMultipleOperator() {
    return [
      ENUMS.AI_REPORTING_FILTER_OPERATOR.IN,
      ENUMS.AI_REPORTING_FILTER_OPERATOR.NOT_IN,
    ].includes(this.args.operator);
  }

  // Boolean field types can't have multiple operators
  get isBooleanFieldType() {
    return this.field.type === ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN;
  }

  get currentValue() {
    return this.args.currentValue;
  }

  get booleanChoices() {
    return [
      ['True', 'true'],
      ['False', 'false'],
    ];
  }

  get fieldChoices() {
    return this.isBooleanFieldType ? this.booleanChoices : this.field.choices;
  }

  get choices() {
    return this.fieldChoices?.map((c) => String(c[1])) ?? [];
  }

  get label() {
    return this.field.label || this.field.filter_key;
  }

  get selectedChoice() {
    const currChoice = this.currentValue as ChoiceValueType | ChoiceValueType[];

    return this.isMultipleOperator && Array.isArray(currChoice)
      ? this.choices?.filter((c) => currChoice?.includes(c))
      : this.choices?.find((c) => c === String(currChoice));
  }

  get dropdownClass() {
    return styles['choice-type-dropdown'];
  }

  @action
  getOptionLabel(opt: ChoiceValueType) {
    return this.fieldChoices?.find((c) => String(c[1]) === String(opt))?.[0];
  }

  @action
  handleChoiceSelection(selection: ChoiceValueType | ChoiceValueType[]) {
    this.args.onAddUpdateFilter(
      this.args.operator,
      this.isBooleanFieldType ? selection === 'true' : selection
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::AdditionalFilters::ChoiceType': typeof AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeComponent;
    'ai-reporting/preview/filter-sections/additional-filters/choice-type': typeof AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeComponent;
  }
}
