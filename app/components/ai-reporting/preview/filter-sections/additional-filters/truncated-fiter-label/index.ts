import Component from '@glimmer/component';

interface AiReportingPreviewFilterSectionsAdditionalFiltersTruncatedFiterLabelSignature {
  Args: {
    extra: { selectedItemLabel: string };
  };
}

export default class AiReportingPreviewFilterSectionsAdditionalFiltersTruncatedFiterLabel extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersTruncatedFiterLabelSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ai-reporting/preview/filter-sections/additional-filters/truncated-fiter-label': typeof AiReportingPreviewFilterSectionsAdditionalFiltersTruncatedFiterLabel;
  }
}
