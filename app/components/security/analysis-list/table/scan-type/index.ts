import Component from '@glimmer/component';
import ENUMS from 'irene/enums';

import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisListTableScanTypeComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel;
  };
}

export default class SecurityAnalysisListTableScanTypeComponent extends Component<SecurityAnalysisListTableScanTypeComponentSignature> {
  get analysis() {
    return this.args.analysis;
  }

  get tags() {
    const types = this.analysis?.vulnerability?.get('types');

    if (types === undefined) {
      return [];
    }

    const tags = [];

    for (const type of Array.from(types)) {
      if (type === ENUMS.VULNERABILITY_TYPE.STATIC) {
        tags.push({
          status: this.analysis?.file?.get('isStaticDone'),
          text: 'static',
        });
      }

      if (type === ENUMS.VULNERABILITY_TYPE.DYNAMIC) {
        tags.push({
          status: this.analysis?.file?.get('isDynamicDone'),
          text: 'dynamic',
        });
      }

      if (type === ENUMS.VULNERABILITY_TYPE.MANUAL) {
        tags.push({
          status: this.analysis?.file?.get('manual') === ENUMS.MANUAL.DONE,
          text: 'manual',
        });
      }

      if (type === ENUMS.VULNERABILITY_TYPE.API) {
        tags.push({
          status: this.analysis?.file?.get('isApiDone'),
          text: 'api',
        });
      }
    }

    return tags;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-list/table/scan-type': typeof SecurityAnalysisListTableScanTypeComponent;
  }
}
