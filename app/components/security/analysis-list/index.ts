import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

export interface SecurityAnalysisListComponentSignature {
  Args: {
    fileDetails: FileModel;
  };
}

export default class SecurityAnalysisListComponent extends Component<SecurityAnalysisListComponentSignature> {
  get sortedAnalyses() {
    return this.args.fileDetails.get('sortedAnalyses');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisList': typeof SecurityAnalysisListComponent;
  }
}
