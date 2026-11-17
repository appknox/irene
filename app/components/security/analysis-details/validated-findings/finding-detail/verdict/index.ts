import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';

import {
  CONFIDENCE_VALUES,
  buildValidation,
  type SecurityValidatedFindingValidationEdit,
} from 'irene/utils/knoxiq-validated-findings';
import FindingEditorDrafts from '../editor-drafts';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';

export interface SecurityAnalysisDetailsValidatedFindingsFindingDetailVerdictSignature {
  Args: {
    finding: SecurityValidatedFindingModel;
    disabled?: boolean;
    // List fields that failed the last save attempt, marked in red.
    invalidListFields?: string[];
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingDetailVerdictComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingDetailVerdictSignature> {
  @service declare intl: IntlService;

  readonly drafts = new FindingEditorDrafts();

  // The scale values are the integers the API accepts; labels translate on
  // render.
  readonly confidenceOptions: number[] = [...CONFIDENCE_VALUES];

  get finding() {
    return this.args.finding;
  }

  get evidenceHtml() {
    return this.drafts.valueFor(
      this.finding.id,
      'evidence',
      this.finding.evidenceHtml
    );
  }

  get reasoningHtml() {
    return this.drafts.valueFor(
      this.finding.id,
      'reasoning',
      this.finding.reasoning
    );
  }

  updateValidation(edit: SecurityValidatedFindingValidationEdit) {
    this.finding.set(
      'validation',
      buildValidation(this.finding.validation, edit)
    );
  }

  @action
  isListFieldInvalid(field: string) {
    return Boolean(this.args.invalidListFields?.includes(field));
  }

  @action
  scaleLabel(value: number) {
    return this.intl.t(
      `securityAnalysisDetails.validatedFindings.scale.${value}`
    );
  }

  @action
  selectConfidence(confidence: number) {
    this.updateValidation({ confidence });
  }

  @action
  updateEvidence(evidence: string) {
    this.drafts.remember(this.finding.id, 'evidence', evidence);
    this.updateValidation({ evidenceHtml: evidence });
  }

  @action
  updateReasoning(reasoning: string) {
    this.drafts.remember(this.finding.id, 'reasoning', reasoning);
    this.updateValidation({ reasoning });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingDetail::Verdict': typeof SecurityAnalysisDetailsValidatedFindingsFindingDetailVerdictComponent;
  }
}
