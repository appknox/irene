import Component from '@glimmer/component';
import { action } from '@ember/object';

import {
  buildPocDetails,
  evidenceFromHtml,
  evidenceToHtml,
  type SecurityValidatedFindingStep,
} from 'irene/utils/knoxiq-validated-findings';
import FindingEditorDrafts from '../editor-drafts';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';
import { type SecurityValidatedFindingPanelId } from '../index';

export interface SecurityAnalysisDetailsValidatedFindingsFindingDetailStepsToReproducePanelSignature {
  Args: {
    finding: SecurityValidatedFindingModel;
    panelId: SecurityValidatedFindingPanelId;
    steps: SecurityValidatedFindingStep[];
    onStepsChange: (steps: SecurityValidatedFindingStep[]) => void;
    disabled?: boolean;
    // List fields that failed the last save attempt, marked in red.
    invalidListFields?: string[];
    isExpanded: boolean;
    onTogglePanel: (panel: SecurityValidatedFindingPanelId) => void;
    onSavePanel: (panel: SecurityValidatedFindingPanelId) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingDetailStepsToReproducePanelComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingDetailStepsToReproducePanelSignature> {
  readonly drafts = new FindingEditorDrafts();

  get finding() {
    return this.args.finding;
  }

  get expectedEvidenceHtml() {
    return this.drafts.valueFor(
      this.finding.id,
      'expectedEvidence',
      evidenceToHtml(this.finding.expectedEvidence)
    );
  }

  @action
  isListFieldInvalid(field: string) {
    return Boolean(this.args.invalidListFields?.includes(field));
  }

  @action
  updateExpectedEvidenceHtml(html: string) {
    this.drafts.remember(this.finding.id, 'expectedEvidence', html);

    this.finding.set(
      'poc',
      buildPocDetails(this.finding.poc, {
        expectedEvidence: evidenceFromHtml(html),
      })
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingDetail::StepsToReproducePanel': typeof SecurityAnalysisDetailsValidatedFindingsFindingDetailStepsToReproducePanelComponent;
  }
}
