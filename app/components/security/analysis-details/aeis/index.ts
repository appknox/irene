import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import { riskClass } from 'irene/helpers/risk-class';

import {
  SECURITY_ANALYSIS_AEIS_LIKELIHOODS,
  SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS,
  SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES,
  aeisRiskForLikelihood,
  buildFullSignals,
  humanizeAeisSignalKey,
  isAeisLikelihood,
  type SecurityAnalysisAeisLikelihood,
} from 'irene/utils/security-aeis';

import type SecurityAnalysisModel from 'irene/models/security/analysis';
import { type SecurityAnalysisExploitabilitySignal } from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsAeisSignalRow {
  key: string;
  label: string;
  selected: SecurityAnalysisExploitabilitySignal;
}

export interface SecurityAnalysisDetailsAeisSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
  };
}

/**
 * Read-only view of the analysis AEIS rollup. The score is the highest of the
 * analysis' validated findings, so it is edited per finding rather than here.
 */
export default class SecurityAnalysisDetailsAeisComponent extends Component<SecurityAnalysisDetailsAeisSignature> {
  @service declare intl: IntlService;

  readonly signalValues = SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES;

  readonly likelihoodOptions: SecurityAnalysisAeisLikelihood[] = [
    ...SECURITY_ANALYSIS_AEIS_LIKELIHOODS,
  ];

  get readOnlyReason() {
    return this.intl.t('securityAnalysisDetails.aeis.readOnlyReason');
  }

  get analysis() {
    return this.args.analysis;
  }

  get exploitability() {
    return this.analysis?.exploitability ?? null;
  }

  get signals() {
    return this.exploitability?.signals ?? {};
  }

  get isUntested() {
    return (
      this.analysis?.exploitabilityScore === null ||
      this.analysis?.exploitabilityScore === undefined
    );
  }

  get likelihood() {
    return this.exploitability?.exploitability_likelihood?.toLowerCase() ?? '';
  }

  get selectedLikelihood() {
    return isAeisLikelihood(this.likelihood) ? this.likelihood : null;
  }

  get displayScore(): string | number {
    const score = this.analysis?.exploitabilityScore;

    return score === null || score === undefined ? '—' : score.toFixed(1);
  }

  get likelihoodLabel() {
    return this.selectedLikelihood
      ? this.intl.t(
          `securityAnalysisDetails.aeis.likelihood.${this.selectedLikelihood}`
        )
      : this.intl.t('securityAnalysisDetails.aeis.untested');
  }

  get scoreLabel() {
    return this.isUntested
      ? this.intl.t('securityAnalysisDetails.aeis.untested')
      : this.likelihoodLabel;
  }

  get scoreRiskClass() {
    const risk = this.isUntested
      ? ENUMS.RISK.UNKNOWN
      : aeisRiskForLikelihood(this.selectedLikelihood);

    return riskClass([risk]);
  }

  get signalRows(): SecurityAnalysisDetailsAeisSignalRow[] {
    const signals = buildFullSignals(this.signals);

    return SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.map((key) => ({
      key,
      label: humanizeAeisSignalKey(key),
      selected: signals[key] as SecurityAnalysisExploitabilitySignal,
    }));
  }

  @action
  signalOptionLabel(value: string | boolean) {
    return this.intl.t(`securityAnalysisDetails.aeis.signal.${String(value)}`);
  }

  @action
  likelihoodOptionLabel(value: string) {
    return this.intl.t(`securityAnalysisDetails.aeis.likelihood.${value}`);
  }

  // The selects are display-only, so nothing acts on a change. AkSelect still
  // needs a handler to render.
  @action
  noop() {}
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Aeis': typeof SecurityAnalysisDetailsAeisComponent;
  }
}
