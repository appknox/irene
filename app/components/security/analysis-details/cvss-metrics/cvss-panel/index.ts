import Component from '@glimmer/component';
import type { CVSSDetails } from 'irene/components/security/analysis-details/cvss-metrics';

interface SecurityAnalysisDetailsCvssMetricsCvssPanelSignature {
  Element: HTMLElement;
  Args: {
    cvssVersion: number | string | undefined | null;
    cvssDetails: CVSSDetails;
    selectDataList: {
      key: string;
      label: string;
      selected: string | number;
      options: (string | number)[];
      getOptionLabel: (value: string | number) => string;
      onSelect: (value: string | number) => void;
    }[];
  };
}

export default class SecurityAnalysisDetailsCvssMetricsCvssPanelComponent extends Component<SecurityAnalysisDetailsCvssMetricsCvssPanelSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::CvssMetrics::CvssPanel': typeof SecurityAnalysisDetailsCvssMetricsCvssPanelComponent;
  }
}
