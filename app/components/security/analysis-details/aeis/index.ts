import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import { riskClass } from 'irene/helpers/risk-class';

import type SecurityAnalysisModel from 'irene/models/security/analysis';

import type {
  SecurityAnalysisAeis,
  SecurityAnalysisAeisSignal,
} from 'irene/models/security/analysis';

export const SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES = [
  'unknown',
  'true',
  'false',
] as const;

const AEIS_LABEL_RISK: Record<string, number> = {
  critical: ENUMS.RISK.CRITICAL,
  high: ENUMS.RISK.HIGH,
  medium: ENUMS.RISK.MEDIUM,
  low: ENUMS.RISK.LOW,
  passed: ENUMS.RISK.NONE,
  none: ENUMS.RISK.NONE,
};

export interface SecurityAnalysisDetailsAeisSignalRow {
  key: string;
  label: string;
  selected: SecurityAnalysisAeisSignal;
}

export interface SecurityAnalysisDetailsAeisSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
  };
}

export default class SecurityAnalysisDetailsAeisComponent extends Component<SecurityAnalysisDetailsAeisSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  readonly signalValues: SecurityAnalysisAeisSignal[] = [
    ...SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES,
  ];

  get analysis() {
    return this.args.analysis;
  }

  get aeis() {
    return this.analysis?.aeis ?? null;
  }

  get signals() {
    return this.aeis?.signals ?? {};
  }

  get isUntested() {
    return this.aeis?.score === null || this.aeis?.score === undefined;
  }

  get score(): string | number {
    return this.isUntested ? '—' : (this.aeis?.score ?? '—');
  }

  get scoreLabel() {
    return this.isUntested
      ? this.intl.t('securityAnalysisDetails.aeis.untested')
      : (this.aeis?.label ?? '');
  }

  get scoreRiskClass() {
    if (this.isUntested) {
      return riskClass([ENUMS.RISK.UNKNOWN]);
    }

    const risk = AEIS_LABEL_RISK[String(this.aeis?.label).toLowerCase()];

    return riskClass([risk ?? ENUMS.RISK.UNKNOWN]);
  }

  get signalRows(): SecurityAnalysisDetailsAeisSignalRow[] {
    return Object.entries(this.signals).map(([key, selected]) => ({
      key,
      label: this.humanizeSignalKey(key),
      selected,
    }));
  }

  // Signal keys are backend-defined, so the label is derived from the key
  // rather than looked up in a fixed list.
  humanizeSignalKey(key: string) {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  applyAeis(aeis: SecurityAnalysisAeis) {
    // @attr() holds a plain object, so a whole new value is required for the
    // template to see the change.
    this.analysis?.set('aeis', aeis);
  }

  @action
  signalOptionLabel(value: SecurityAnalysisAeisSignal) {
    return this.intl.t(`securityAnalysisDetails.aeis.signal.${value}`);
  }

  @action
  selectSignal(key: string, value: SecurityAnalysisAeisSignal) {
    if (!this.aeis) {
      return;
    }

    this.applyAeis({
      ...this.aeis,
      signals: { ...this.aeis.signals, [key]: value },
    });
  }

  @action
  resetSignals() {
    if (!this.aeis) {
      return;
    }

    const clearedSignals = Object.fromEntries(
      Object.keys(this.aeis.signals).map((key) => [
        key,
        'unknown' as SecurityAnalysisAeisSignal,
      ])
    );

    this.applyAeis({ score: null, label: '', signals: clearedSignals });

    this.notify.success(this.intl.t('securityAnalysisDetails.aeis.resetDone'));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Aeis': typeof SecurityAnalysisDetailsAeisComponent;
  }
}
