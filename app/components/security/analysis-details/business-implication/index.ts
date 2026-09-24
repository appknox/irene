import Component from '@glimmer/component';
import { action } from '@ember/object';

import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsBusinessImplicationSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
  };
}

export default class SecurityAnalysisDetailsBusinessImplicationComponent extends Component<SecurityAnalysisDetailsBusinessImplicationSignature> {
  get businessImplication() {
    return this.args.analysis?.businessImplication ?? '';
  }

  @action
  updateBusinessImplication(event: Event) {
    this.args.analysis?.set(
      'businessImplication',
      (event.target as HTMLTextAreaElement).value
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::BusinessImplication': typeof SecurityAnalysisDetailsBusinessImplicationComponent;
  }
}
