import Component from '@glimmer/component';

interface AiReportingPreviewFilterSectionsAdditionalFiltersTruncatedFilterLabelSignature {
  Args: {
    extra: { selectedItemLabel: string };
  };
}

export default class AiReportingPreviewFilterSectionsAdditionalFiltersTruncatedFilterLabel extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersTruncatedFilterLabelSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ai-reporting/preview/filter-sections/additional-filters/truncated-filter-label': typeof AiReportingPreviewFilterSectionsAdditionalFiltersTruncatedFilterLabel;
  }
}
