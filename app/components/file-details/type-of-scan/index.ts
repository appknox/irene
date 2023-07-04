import Component from '@glimmer/component';
import AnalysisModel from 'irene/models/analysis';
import ENUMS from 'irene/enums';

export interface FileDetailsVulnerabilityAnalysesTypeOfScanSignature {
  Args: {
    analysis: AnalysisModel;
    chipSize?: 'small' | 'medium';
    justifyContent?: 'flex-start' | 'flex-end';
    tooltipPlacement?: 'top' | 'bottom';
  };
}

export default class FileDetailsVulnerabilityAnalysesTypeOfScanComponent extends Component<FileDetailsVulnerabilityAnalysesTypeOfScanSignature> {
  get isSizeMedium() {
    return this.args.chipSize === 'medium';
  }

  get tags() {
    const types = this.args.analysis.vulnerabilityTypes;

    if (types === undefined) {
      return [];
    }

    const tags = [];

    for (const type of Array.from(types)) {
      if (type === ENUMS.VULNERABILITY_TYPE.STATIC) {
        tags.push({
          status: this.args.analysis.file.get?.('isStaticDone'),
          text: 'static',
        });
      }

      if (type === ENUMS.VULNERABILITY_TYPE.DYNAMIC) {
        tags.push({
          status: this.args.analysis.file.get?.('isDynamicDone'),
          text: 'dynamic',
        });
      }

      if (type === ENUMS.VULNERABILITY_TYPE.MANUAL) {
        tags.push({
          status: this.args.analysis.file.get?.('isManualDone'),
          text: 'manual',
        });
      }

      if (type === ENUMS.VULNERABILITY_TYPE.API) {
        tags.push({
          status: this.args.analysis.file.get?.('isApiDone'),
          text: 'api',
        });
      }
    }

    return tags;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::TypeOfScan': typeof FileDetailsVulnerabilityAnalysesTypeOfScanComponent;
    'file-details/type-of-scan': typeof FileDetailsVulnerabilityAnalysesTypeOfScanComponent;
  }
}
