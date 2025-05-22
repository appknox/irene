import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';
import type { PreviewFilterField } from 'irene/models/ai-reporting/report-request';

// Component Types
export const AI_REPORT_FILTER_TEXT_TYPE_COMPONENT =
  'ai-reporting/preview/filter-sections/additional-filters/text-type';

export const AI_REPORT_FILTER_DATE_TYPE_COMPONENT =
  'ai-reporting/preview/filter-sections/additional-filters/date-type';

export const AI_REPORT_FILTER_CHOICE_TYPE_COMPONENT =
  'ai-reporting/preview/filter-sections/additional-filters/choice-type';

// Helper
export function aiReportAdvFilterValComp(params: [PreviewFilterField]) {
  const field = params[0];

  if (field.choices) {
    return AI_REPORT_FILTER_CHOICE_TYPE_COMPONENT;
  }

  switch (field.type) {
    case ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN:
      return AI_REPORT_FILTER_CHOICE_TYPE_COMPONENT;

    case ENUMS.AI_REPORTING_FIELD_TYPE.STRING:
    case ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER:
    case ENUMS.AI_REPORTING_FIELD_TYPE.NUMBER:
    case ENUMS.AI_REPORTING_FIELD_TYPE.FLOAT:
      return AI_REPORT_FILTER_TEXT_TYPE_COMPONENT;

    case ENUMS.AI_REPORTING_FIELD_TYPE.DATETIME:
      return AI_REPORT_FILTER_DATE_TYPE_COMPONENT;

    default:
      return AI_REPORT_FILTER_TEXT_TYPE_COMPONENT;
  }
}

const AiReportAdvFilterValComp = helper(aiReportAdvFilterValComp);

export default AiReportAdvFilterValComp;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ai-report-adv-filter-val-comp': typeof AiReportAdvFilterValComp;
  }
}
