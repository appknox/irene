import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import { riskClass } from 'irene/helpers/risk-class';

import {
  EXPLOITABILITY_LIKELIHOOD_VALUES,
  buildExploitability,
  type SecurityValidatedFindingExploitabilityEdit,
} from 'irene/utils/knoxiq-validated-findings';

import {
  SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS,
  SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES,
  buildFullSignals,
  humanizeAeisSignalKey,
} from 'irene/utils/security-aeis';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';
import { type SecurityAnalysisExploitabilitySignal } from 'irene/models/security/analysis';
import { type SecurityValidatedFindingPanelId } from '../index';

export interface SecurityValidatedFindingSignalRow {
  key: string;
  label: string;
  selected: SecurityAnalysisExploitabilitySignal;
}

// The finding scale is -1/1/2/3; the chip colours come off the risk scale.
const VALIDATED_FINDING_LIKELIHOOD_RISK: Record<number, number> = {
  3: ENUMS.RISK.HIGH,
  2: ENUMS.RISK.MEDIUM,
  1: ENUMS.RISK.LOW,
};

export interface SecurityAnalysisDetailsValidatedFindingsFindingDetailAeisPanelSignature {
  Args: {
    finding: SecurityValidatedFindingModel;
    panelId: SecurityValidatedFindingPanelId;
    disabled?: boolean;
    isExpanded: boolean;
    onTogglePanel: (panel: SecurityValidatedFindingPanelId) => void;
    onSavePanel: (panel: SecurityValidatedFindingPanelId) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingDetailAeisPanelComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingDetailAeisPanelSignature> {
  @service declare intl: IntlService;

  // The API scores both on the same -1/1/2/3 scale, so the option values are
  // the integers it accepts and the labels are translated on render.
  readonly signalValues = SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES;
  readonly likelihoodOptions: number[] = [...EXPLOITABILITY_LIKELIHOOD_VALUES];

  get finding() {
    return this.args.finding;
  }

  get displayScore(): string | number {
    const score = this.finding.exploitabilityScore;

    return score === null || score === undefined ? '—' : score.toFixed(1);
  }

  get scoreLabel() {
    return this.scaleLabel(this.finding.exploitabilityLikelihood);
  }

  get scoreRiskClass() {
    return riskClass([
      VALIDATED_FINDING_LIKELIHOOD_RISK[
        this.finding.exploitabilityLikelihood
      ] ?? ENUMS.RISK.UNKNOWN,
    ]);
  }

  get currentSignals() {
    return buildFullSignals(this.finding.exploitability?.signals);
  }

  get signalRows(): SecurityValidatedFindingSignalRow[] {
    const signals = this.currentSignals;

    return SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.map((key) => ({
      key,
      label: humanizeAeisSignalKey(key),
      selected: signals[key] as SecurityAnalysisExploitabilitySignal,
    }));
  }

  updateExploitability(edit: SecurityValidatedFindingExploitabilityEdit) {
    this.finding.set(
      'exploitability',
      buildExploitability(this.finding.exploitability, edit)
    );
  }

  @action
  scaleLabel(value: number) {
    return this.intl.t(
      `securityAnalysisDetails.validatedFindings.scale.${value}`
    );
  }

  @action
  signalOptionLabel(value: string | boolean) {
    return this.intl.t(`securityAnalysisDetails.aeis.signal.${String(value)}`);
  }

  @action
  selectLikelihood(likelihood: number) {
    this.updateExploitability({ likelihood });
  }

  @action
  selectSignal(key: string, value: SecurityAnalysisExploitabilitySignal) {
    this.updateExploitability({
      signals: { ...this.currentSignals, [key]: value },
    });
  }

  @action
  updateScore(score: number) {
    this.updateExploitability({ score });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingDetail::AeisPanel': typeof SecurityAnalysisDetailsValidatedFindingsFindingDetailAeisPanelComponent;
  }
}
