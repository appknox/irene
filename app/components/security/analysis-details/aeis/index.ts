import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, task, timeout } from 'ember-concurrency';

import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import { riskClass } from 'irene/helpers/risk-class';

import {
  SECURITY_ANALYSIS_AEIS_LIKELIHOODS,
  SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS,
  SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES,
  aeisOverrideUrl,
  aeisRiskForLikelihood,
  buildFullSignals,
  isAeisLikelihood,
  type SecurityAnalysisAeisLikelihood,
  type SecurityAnalysisAeisOverridePayload,
  type SecurityAnalysisAeisSignals,
} from 'irene/utils/security-aeis';

import type IreneAjaxService from 'irene/services/ajax';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import { type SecurityAnalysisExploitabilitySignal } from 'irene/models/security/analysis';

export const SECURITY_ANALYSIS_AEIS_SCORE_MIN = 0;
export const SECURITY_ANALYSIS_AEIS_SCORE_MAX = 10;
export const SECURITY_ANALYSIS_AEIS_SCORE_STEP = 0.1;
const AEIS_WRITE_DEBOUNCE_MS = 600;

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

export default class SecurityAnalysisDetailsAeisComponent extends Component<SecurityAnalysisDetailsAeisSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;

  // Edits are optimistic: each field holds its own pending value until a
  // write lands, so the card shows what was asked for rather than what was
  // last persisted. null means "untouched, read the record".
  @tracked pendingScore: number | null = null;
  @tracked pendingLikelihood: SecurityAnalysisAeisLikelihood | null = null;
  @tracked pendingSignals: SecurityAnalysisAeisSignals | null = null;

  // The raw text while someone is typing, which may be mid-edit and not yet
  // a usable number ('', '7.', '12'). Cleared once a write lands.
  @tracked scoreDraft: string | null = null;

  // True only while the request is in flight, not during the debounce, so the
  // card does not flicker a loader on every keystroke.
  @tracked isWriting = false;

  readonly signalValues = SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES;
  readonly scoreMin = SECURITY_ANALYSIS_AEIS_SCORE_MIN;
  readonly scoreMax = SECURITY_ANALYSIS_AEIS_SCORE_MAX;
  readonly scoreStepUp = SECURITY_ANALYSIS_AEIS_SCORE_STEP;
  readonly scoreStepDown = -SECURITY_ANALYSIS_AEIS_SCORE_STEP;

  readonly likelihoodOptions: SecurityAnalysisAeisLikelihood[] = [
    ...SECURITY_ANALYSIS_AEIS_LIKELIHOODS,
  ];

  get analysis() {
    return this.args.analysis;
  }

  get exploitability() {
    return this.analysis?.exploitability ?? null;
  }

  get signals() {
    return this.exploitability?.signals ?? {};
  }

  get isPassed() {
    return Boolean(this.analysis?.hasPassedAeisOverride);
  }

  get isUntested() {
    return (
      this.analysis?.exploitabilityScore === null ||
      this.analysis?.exploitabilityScore === undefined
    );
  }

  get score(): string | number {
    return this.isUntested ? '—' : (this.analysis?.exploitabilityScore ?? '—');
  }

  get likelihood() {
    return this.exploitability?.exploitability_likelihood?.toLowerCase() ?? '';
  }

  get selectedLikelihood() {
    if (this.pendingLikelihood) {
      return this.pendingLikelihood;
    }

    return isAeisLikelihood(this.likelihood) ? this.likelihood : null;
  }

  get currentSignals(): SecurityAnalysisAeisSignals {
    return this.pendingSignals ?? buildFullSignals(this.signals);
  }

  get scoreLabel() {
    if (this.isPassed) {
      return this.intl.t('passed');
    }

    if (this.isUntested && this.pendingScore === null) {
      return this.intl.t('securityAnalysisDetails.aeis.untested');
    }

    return this.selectedLikelihood
      ? this.intl.t(
          `securityAnalysisDetails.aeis.likelihood.${this.selectedLikelihood}`
        )
      : '';
  }

  get scoreRiskClass() {
    if (this.isPassed) {
      return riskClass([ENUMS.RISK.NONE]);
    }

    const risk =
      this.isUntested && this.pendingScore === null
        ? ENUMS.RISK.UNKNOWN
        : aeisRiskForLikelihood(this.selectedLikelihood);

    return riskClass([risk]);
  }

  get signalRows(): SecurityAnalysisDetailsAeisSignalRow[] {
    const signals = this.currentSignals;

    return SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.map((key) => ({
      key,
      label: this.humanizeSignalKey(key),
      selected: signals[key] as SecurityAnalysisExploitabilitySignal,
    }));
  }

  get currentScore() {
    return this.pendingScore ?? this.analysis?.exploitabilityScore ?? null;
  }

  get displayScore(): string | number {
    return this.currentScore === null ? '—' : this.currentScore.toFixed(1);
  }

  get scoreFieldValue() {
    if (this.scoreDraft !== null) {
      return this.scoreDraft;
    }

    return this.currentScore === null ? '' : this.currentScore.toFixed(1);
  }

  get isDecrementDisabled() {
    return (this.currentScore ?? 0) <= this.scoreMin;
  }

  get isIncrementDisabled() {
    return (this.currentScore ?? 0) >= this.scoreMax;
  }

  get isSaving() {
    return this.isWriting || this.clearOverride.isRunning;
  }

  get overrideUrl() {
    return aeisOverrideUrl(this.analysis?.id);
  }

  humanizeSignalKey(key: string) {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  discardPendingEdits() {
    this.pendingScore = null;
    this.pendingLikelihood = null;
    this.pendingSignals = null;
    this.scoreDraft = null;
  }

  @action
  signalOptionLabel(
    value: SecurityAnalysisExploitabilitySignal | string | boolean
  ) {
    return this.intl.t(`securityAnalysisDetails.aeis.signal.${String(value)}`);
  }

  @action
  likelihoodOptionLabel(value: SecurityAnalysisAeisLikelihood | string) {
    return this.intl.t(`securityAnalysisDetails.aeis.likelihood.${value}`);
  }

  clampAEISScore(value: number) {
    return Number(
      Math.min(this.scoreMax, Math.max(this.scoreMin, value)).toFixed(1)
    );
  }

  @action
  stepScore(delta: number) {
    this.scoreDraft = null;
    this.pendingScore = this.clampAEISScore((this.currentScore ?? 0) + delta);

    this.scheduleWrite();
  }

  @action
  updateScore(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = Number.parseFloat(raw);

    this.scoreDraft = raw;

    if (raw.trim() === '' || Number.isNaN(parsed)) {
      return;
    }

    this.pendingScore = this.clampAEISScore(parsed);
    this.scheduleWrite();
  }

  @action
  commitScore() {
    this.scoreDraft = null;
  }

  @action
  selectLikelihood(likelihood: SecurityAnalysisAeisLikelihood) {
    this.pendingLikelihood = likelihood;

    this.scheduleWrite();
  }

  @action
  selectSignal(key: string, value: SecurityAnalysisExploitabilitySignal) {
    this.pendingSignals = { ...this.currentSignals, [key]: value };
    this.scheduleWrite();
  }

  @action
  resetSignals() {
    this.clearOverride.perform();
  }

  scheduleWrite() {
    this.writeOverride.perform();
  }

  /**
   * One queue for all three fields. Restartable rather than dropping, so an
   * edit made while a write is pending joins that write instead of being
   * discarded, and a run of edits across fields becomes a single request.
   */
  writeOverride = restartableTask(async () => {
    await timeout(AEIS_WRITE_DEBOUNCE_MS);

    const likelihood = this.selectedLikelihood;

    if (!likelihood) {
      this.notify.error(
        this.intl.t('securityAnalysisDetails.aeis.likelihoodRequired')
      );

      return;
    }

    const payload: SecurityAnalysisAeisOverridePayload = {
      score: this.currentScore ?? this.scoreMin,
      likelihood,
      signals: this.currentSignals,
    };

    const saved = await this.sendOverride(() =>
      this.ajax.put(this.overrideUrl, {
        namespace: ENV.namespace_v2,
        data: JSON.stringify(payload),
      })
    );

    if (saved) {
      this.discardPendingEdits();
    }
  });

  clearOverride = task({ drop: true }, async () => {
    const cleared = await this.sendOverride(() =>
      this.ajax.delete(this.overrideUrl, { namespace: ENV.namespace_v2 })
    );

    if (cleared) {
      this.discardPendingEdits();
    }
  });

  async sendOverride(request: () => Promise<unknown>) {
    this.isWriting = true;

    try {
      await request();
      await this.analysis?.reload();

      this.notify.success(this.intl.t('securityAnalysisDetails.aeis.saved'));

      return true;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

      return false;
    } finally {
      this.isWriting = false;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Aeis': typeof SecurityAnalysisDetailsAeisComponent;
  }
}
