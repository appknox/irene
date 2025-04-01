import Component from '@glimmer/component';
import { action } from '@ember/object';
import ENUMS from 'irene/enums';

import type {
  PreviewFilterDetails,
  AdditionalFilter,
} from 'irene/models/report-request';

interface AiReportingPreviewFilterSectionsAdditionalFiltersSignature {
  Args: {
    additionalFilters: AdditionalFilter[];
    filterDetails: PreviewFilterDetails[];

    onAddUpdateFilter: (
      id: string,
      detail: AdditionalFilter['filter_details']
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsAdditionalFiltersComponent extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersSignature> {
  @action
  getFilterOperators(type: string) {
    switch (type) {
      case ENUMS.AI_REPORTING_FIELD_TYPE.STRING:
        return [
          ENUMS.AI_REPORTING_FILTER_OPERATOR.EQ,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.NEQ,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.CONTAINS,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.ICONTAINS,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.STARTSWITH,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.ENDSWITH,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.EXISTS,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.ISNULL,
        ];

      case ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER:
      case ENUMS.AI_REPORTING_FIELD_TYPE.NUMBER:
        return [
          ENUMS.AI_REPORTING_FILTER_OPERATOR.EQ,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.NEQ,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.GT,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.GTE,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.LT,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.LTE,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.EXISTS,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.ISNULL,
        ];

      case ENUMS.AI_REPORTING_FIELD_TYPE.DATETIME:
        return [
          ENUMS.AI_REPORTING_FILTER_OPERATOR.EQ,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.NEQ,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.GT,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.GTE,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.LT,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.LTE,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.EXISTS,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.ISNULL,
        ];

      case ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN:
        return [
          ENUMS.AI_REPORTING_FILTER_OPERATOR.EQ,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.NEQ,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.EXISTS,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.ISNULL,
        ];

      default:
        return [
          ENUMS.AI_REPORTING_FILTER_OPERATOR.EQ,
          ENUMS.AI_REPORTING_FILTER_OPERATOR.NEQ,
        ];
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::AdditionalFilters': typeof AiReportingPreviewFilterSectionsAdditionalFiltersComponent;
  }
}
