import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';
import type { PreviewFilterField } from 'irene/models/report-request';

export function aiReportFilterOperators(params: [PreviewFilterField]) {
  const filter = params[0];

  // FIELD TYPES
  const { DATETIME, INTEGER, FLOAT, NUMBER, STRING } =
    ENUMS.AI_REPORTING_FIELD_TYPE;

  // OPERATORS
  const {
    EQ,
    NEQ,
    IN,
    NOT_IN,
    EXISTS,
    ISNULL,
    GT,
    GTE,
    LT,
    LTE,
    CONTAINS,
    ICONTAINS,
    STARTSWITH,
    ENDSWITH,
    RANGE,
  } = ENUMS.AI_REPORTING_FILTER_OPERATOR;

  // FILTER DETAILS
  const filterType = filter?.type;
  const filterIsNullable = filter?.is_nullable;

  const filterIsDateOrNumber = [DATETIME, INTEGER, FLOAT, NUMBER].includes(
    String(filterType)
  );

  // Common operators for all field types
  const commonOperators = [EQ, NEQ, IN, NOT_IN, EXISTS];

  const baseOperators = [
    ...commonOperators,
    ...(filterIsNullable ? [ISNULL] : []),
    ...(filterIsDateOrNumber ? [GT, GTE, LT, LTE] : []),
  ];

  switch (filterType) {
    case STRING:
      return [...baseOperators, CONTAINS, ICONTAINS, STARTSWITH, ENDSWITH];

    case INTEGER:
    case FLOAT:
    case NUMBER:
      return baseOperators;

    case DATETIME:
      return [...baseOperators, RANGE];
  }

  // Default to the base operators -> BOOLEAN
  return baseOperators;
}

const AiReportFilterOperatorHelpers = helper(aiReportFilterOperators);

export default AiReportFilterOperatorHelpers;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ai-report-filter-operators': typeof AiReportFilterOperatorHelpers;
  }
}
