import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

import type Store from '@ember-data/store';

import SecurityAnalysisModel, {
  type SecurityAnalysisFinding,
} from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsFindingsAddFormComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    addNewFinding(finding: SecurityAnalysisFinding): void;
  };
}

export default class SecurityAnalysisDetailsFindingsAddFormComponent extends Component<SecurityAnalysisDetailsFindingsAddFormComponentSignature> {
  @service declare store: Store;
  @service declare notifications: NotificationService;

  @tracked addedFindings: SecurityAnalysisFinding[] = [];
  @tracked findingTitle = '';
  @tracked findingDescription = '';

  get analysis() {
    return this.args.analysis;
  }

  @action addFinding() {
    const findingTitle = this.findingTitle;
    const findingDescription = this.findingDescription;

    if (isEmpty(findingDescription)) {
      return this.notifications.error('Please fill the description');
    }

    const newFinding = {
      title: findingTitle,
      description: findingDescription,
    };

    this.args.addNewFinding(newFinding);
    this.notifications.success('Finding Added');

    this.findingTitle = '';
    this.findingDescription = '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Findings::AddForm': typeof SecurityAnalysisDetailsFindingsAddFormComponent;
  }
}
