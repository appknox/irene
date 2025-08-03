import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

import type {
  PreviewFilterField,
  AdditionalFilterFilterDetailsExpression,
  AdditionalFilterFilterDetailsExpressionValues,
  AdditionalFilterErroredFieldProp,
} from 'irene/models/ai-reporting/report-request';

import styles from './index.scss';

// Component Types
export const AI_REPORT_FILTER_TEXT_TYPE_COMPONENT =
  'ai-reporting/preview/filter-sections/additional-filters/text-type';

export const AI_REPORT_FILTER_DATE_TYPE_COMPONENT =
  'ai-reporting/preview/filter-sections/additional-filters/date-type';

export const AI_REPORT_FILTER_CHOICE_TYPE_COMPONENT =
  'ai-reporting/preview/filter-sections/additional-filters/choice-type';

// Filter operators labels
const FILTER_OPERATORS_LABELS = {
  eq: 'equalTo',
  neq: 'notEqualTo',
  gt: 'greaterThan',
  gte: 'greaterThanOrEqual',
  lt: 'lessThan',
  lte: 'lessThanOrEqual',
  in: 'anyOf',
  not_in: 'noneOf',
  contains: 'contains',
  icontains: 'containsCaseInsensitive',
  startswith: 'startsWith',
  endswith: 'endsWith',
  range: 'range',
  exists: 'exists',
  isnull: 'doesNotExist',
};

interface AiReportingPreviewFilterSectionsAdditionalFiltersFilterFieldSignature {
  Args: {
    sectionId: string;
    field: PreviewFilterField;
    operators: string[];
    erroredFields: Record<string, AdditionalFilterErroredFieldProp>;
    allCurrFilters: Record<string, AdditionalFilterFilterDetailsExpression>;

    onAddUpdateFilter: (
      id: string,
      detail: Record<string, AdditionalFilterFilterDetailsExpression>
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsAdditionalFiltersFilterFieldComponent extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersFilterFieldSignature> {
  @service declare intl: IntlService;

  get allCurrFilters() {
    return this.args.allCurrFilters;
  }

  get field() {
    return this.args.field;
  }

  get fieldKey() {
    return this.field.filter_key ?? this.field.field;
  }

  get currentValue() {
    return this.allCurrFilters?.[this.fieldKey]?.value ?? null;
  }

  get fieldDetails() {
    return this.allCurrFilters?.[this.fieldKey];
  }

  get erroredFields() {
    return this.args.erroredFields;
  }

  get availableOperators() {
    return this.args.operators;
  }

  get operator() {
    return (this.fieldDetails?.operator ||
      this.availableOperators[0]) as string;
  }

  get fieldErrorInfo() {
    return this.erroredFields[`${this.args.sectionId}-${this.fieldKey}`];
  }

  get fieldError() {
    return !!this.fieldErrorInfo?.field;
  }

  get valueComponent() {
    if (this.field.choices) {
      return AI_REPORT_FILTER_CHOICE_TYPE_COMPONENT;
    }

    switch (this.field.type) {
      case ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN:
        return AI_REPORT_FILTER_CHOICE_TYPE_COMPONENT;

      case ENUMS.AI_REPORTING_FIELD_TYPE.STRING:
      case ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER:
      case ENUMS.AI_REPORTING_FIELD_TYPE.NUMBER:
      case ENUMS.AI_REPORTING_FIELD_TYPE.FLOAT:
      case ENUMS.AI_REPORTING_FIELD_TYPE.LIST:
        return AI_REPORT_FILTER_TEXT_TYPE_COMPONENT;

      case ENUMS.AI_REPORTING_FIELD_TYPE.DATETIME:
        return AI_REPORT_FILTER_DATE_TYPE_COMPONENT;

      default:
        return AI_REPORT_FILTER_TEXT_TYPE_COMPONENT;
    }
  }

  get filterFieldDropdownClass() {
    return styles['filter-field-dropdown'];
  }

  get nullOperator() {
    return ENUMS.AI_REPORTING_FILTER_OPERATOR.ISNULL;
  }

  get existsOperator() {
    return ENUMS.AI_REPORTING_FILTER_OPERATOR.EXISTS;
  }

  get inOperators() {
    return [
      ENUMS.AI_REPORTING_FILTER_OPERATOR.IN,
      ENUMS.AI_REPORTING_FILTER_OPERATOR.NOT_IN,
    ];
  }

  get hideValueComponent() {
    return [this.nullOperator, this.existsOperator].includes(this.operator);
  }

  @action
  getFilterOperatorLabel(operator: string) {
    const key = `${operator}` as keyof typeof FILTER_OPERATORS_LABELS;

    return this.intl.t(
      `reportModule.advancedFilters.${FILTER_OPERATORS_LABELS[key]}`
    );
  }

  @action resolveTextFieldValue(
    newOp: string,
    value:
      | AdditionalFilterFilterDetailsExpressionValues
      | AdditionalFilterFilterDetailsExpressionValues[]
  ) {
    const existingOp = this.operator;
    const newOpIsIn = this.inOperators.includes(newOp);
    const existingOpIsIn = this.inOperators.includes(existingOp);

    if ((existingOpIsIn && newOpIsIn) || (!existingOpIsIn && !newOpIsIn)) {
      return value;
    }

    if (value && Array.isArray(value)) {
      return value.join(',');
    }

    if (value && typeof value === 'string') {
      return value.split(',');
    }

    return value;
  }

  @action
  handleOperatorChange(newOperator: string) {
    const operatorIsNull = newOperator === this.nullOperator;
    const operatorIsExists = newOperator === this.existsOperator;

    const isTextFieldValue =
      this.valueComponent === AI_REPORT_FILTER_TEXT_TYPE_COMPONENT;

    let value = null;

    if (operatorIsNull) {
      value = true;
    } else if (operatorIsExists) {
      value = null;
    } else if (isTextFieldValue) {
      value = this.resolveTextFieldValue(newOperator, this.currentValue);
    }

    // Update the filter
    this.handleAddUpdateFilter(newOperator, value);
  }

  @action
  handleAddUpdateFilter(
    operator: string,
    value:
      | AdditionalFilterFilterDetailsExpressionValues
      | AdditionalFilterFilterDetailsExpressionValues[]
  ) {
    this.args.onAddUpdateFilter(this.args.sectionId, {
      [this.fieldKey]: {
        filterMetaInfo: this.args.field,
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
