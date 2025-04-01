import Component from '@glimmer/component';

import type { FilterColumn } from 'irene/services/ai-reporting';

import type {
  PreviewFilterDetails,
  AdditionalFilter,
} from 'irene/models/report-request';

interface AiReportingPreviewFilterSectionsSignature {
  Args: {
    filterDetails: PreviewFilterDetails[];
    allColumnsMap: Map<string, FilterColumn>;
    additionalFilters: AdditionalFilter[];
    onColumnsChange: (allColumnsMap: Map<string, FilterColumn>) => void;

    onAddUpdateFilter: (
      id: string,
      detail: AdditionalFilter['filter_details']
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsComponent extends Component<AiReportingPreviewFilterSectionsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections': typeof AiReportingPreviewFilterSectionsComponent;
  }
}
