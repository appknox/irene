import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';

import SecurityAnalysisModel, {
  SecurityAnalysisFinding,
} from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsFindingsComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
  };
}

export default class SecurityAnalysisDetailsFindingsComponent extends Component<SecurityAnalysisDetailsFindingsComponentSignature> {
  @service declare store: Store;
  @service declare notifications: NotificationService;

  @tracked findingId = 0;
  @tracked newAndOldFindings: SecurityAnalysisFinding[] | null = null;
  @tracked showRemoveFindingConfirmBox = false;
  @tracked showClearAllFindingsConfirmBox = false;
  @tracked addedFindings: SecurityAnalysisFinding[] = [];

  @tracked deletedFindingId: number | null = null;

  get analysis() {
    return this.args.analysis;
  }

  get allFindings() {
    let findingId = this.findingId;
    const findings = this.newAndOldFindings || this.analysis?.findings;

    if (findings) {
      findings.forEach((finding) => {
        findingId = findingId + 1;
        finding.id = findingId;
      });

      return findings;
    }

    return [];
  }

  @action openRemoveFindingConfirmBox(findingId: number) {
    this.deletedFindingId = findingId;
    this.showRemoveFindingConfirmBox = true;
  }

  @action closeRemoveFindingConfirmBox() {
    this.deletedFindingId = null;
    this.showRemoveFindingConfirmBox = false;
  }

  @action openClearAllFindingConfirmBox() {
    this.showClearAllFindingsConfirmBox = true;
  }

  @action closeClearAllFindingConfirmBox() {
    this.showClearAllFindingsConfirmBox = false;
  }

  @action clearAllFindings() {
    this.analysis?.set('findings', []);

    this.newAndOldFindings = [];
    this.showClearAllFindingsConfirmBox = false;
  }

  @action deleteFinding() {
    const availableFindings =
      this.allFindings?.filter(
        (finding) => finding.id !== this.deletedFindingId
      ) || [];

    this.newAndOldFindings = availableFindings;

    this.analysis?.set('findings', [...availableFindings]);

    this.showRemoveFindingConfirmBox = false;
  }

  @action addNewFinding(newFinding: SecurityAnalysisFinding) {
    const findings = this.allFindings;

    findings.push(newFinding);

    this.newAndOldFindings = findings;

    this.analysis?.set('findings', findings);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Findings': typeof SecurityAnalysisDetailsFindingsComponent;
  }
}
