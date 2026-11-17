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

  // The rollup takes the highest of the true positive findings, so an
  // analysis with none has nothing to score however its findings read.
  get showAllFalsePositivesBanner() {
    return Boolean(this.analysis?.isKnoxiqAllFp);
  }

  // A passed analysis is not unscored, so saying so would be wrong.
  get noScoreMessage() {
    return this.intl.t(
      this.isPassed
        ? 'securityAnalysisDetails.aeis.notScoredWhenPassed'
        : 'securityAnalysisDetails.aeis.noScoreYet'
    );
  }

  // The banner already carries the reason, so repeating it under the chip
  // would say the same thing twice.
  get showNoScoreMessage() {
    return (
      (this.isUntested || this.isPassed) && !this.showAllFalsePositivesBanner
    );
  }

  /**
   * Why the fields are read-only here. The rollup explanation only holds
   * when a finding stands behind the score, so each state that has none
   * gives its own reason instead.
   */
  get readOnlyReason() {
    if (this.isPassed) {
      return this.intl.t('securityAnalysisDetails.aeis.notScoredWhenPassed');
    }

    if (this.showAllFalsePositivesBanner) {
      return this.intl.t('securityAnalysisDetails.aeis.allFalsePositives');
    }

    if (this.isUntested) {
      return this.intl.t('securityAnalysisDetails.aeis.noScoreYet');
    }

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

  // A passed analysis has no rollup to show: the backend reports null
  // exploitability for it, whatever its findings still score.
  get isPassed() {
    return Boolean(this.analysis?.isPassed);
  }

  get isUntested() {
    return (
      !this.isPassed &&
      (this.analysis?.exploitabilityScore === null ||
        this.analysis?.exploitabilityScore === undefined)
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
    if (this.isPassed) {
      return this.intl.t('passed');
    }

    return this.isUntested
      ? this.intl.t('securityAnalysisDetails.aeis.untested')
      : this.likelihoodLabel;
  }

  get scoreRiskClass() {
    if (this.isPassed) {
      return riskClass([ENUMS.RISK.NONE]);
    }

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
