import Component from '@glimmer/component';

export interface SegmentedOption {
  value: string;
  label: string;
}

interface AiReportingPreviewChartCustomizeSegmentedSignature {
  Element: HTMLDivElement;
  Args: {
    label?: string;
    options: SegmentedOption[];
    selected: string;
    onSelect: (value: string) => void;
  };
}

/** A row of buttons for picking one of a few options, like the analytics settings panel. */
export default class AiReportingPreviewChartCustomizeSegmentedComponent extends Component<AiReportingPreviewChartCustomizeSegmentedSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::Chart::Customize::Segmented': typeof AiReportingPreviewChartCustomizeSegmentedComponent;
  }
}
