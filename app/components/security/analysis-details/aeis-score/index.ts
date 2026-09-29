import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type IreneAjaxService from 'irene/services/ajax';

export interface SecurityAnalysisDetailsAeisScoreComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
  };
}

const LIKELIHOOD_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default class SecurityAnalysisDetailsAeisScoreComponent extends Component<SecurityAnalysisDetailsAeisScoreComponentSignature> {
  @service declare notifications: NotificationService;
  @service declare ajax: IreneAjaxService;

  @tracked isEditing = false;
  @tracked scoreInput = '';
  @tracked likelihoodInput: { value: string; label: string } | null = null;

  likelihoodOptions = LIKELIHOOD_OPTIONS;

  get analysis() {
    return this.args.analysis;
  }

  get currentScore() {
    return this.analysis?.exploitabilityScore ?? null;
  }

  get currentLikelihoodLabel() {
    return this.analysis?.exploitability?.exploitability_likelihood ?? null;
  }

  get hasAeisData() {
    return this.currentScore !== null;
  }

  @action startEdit() {
    this.scoreInput =
      this.currentScore !== null ? String(this.currentScore) : '';

    const currentValue = this.currentLikelihoodLabel?.toLowerCase();

    this.likelihoodInput =
      this.likelihoodOptions.find((o) => o.value === currentValue) ?? null;

    this.isEditing = true;
  }

  @action cancelEdit() {
    this.isEditing = false;
  }

  @action selectLikelihood(option: { value: string; label: string }) {
    this.likelihoodInput = option;
  }

  @action setScoreInput(event: Event) {
    this.scoreInput = (event.target as HTMLInputElement).value;
  }

  @action triggerSave() {
    this.saveOverride.perform();
  }

  @action triggerClear() {
    this.clearOverride.perform();
  }

  saveOverride = task(async () => {
    const score = Number(this.scoreInput);

    if (Number.isNaN(score) || score < 0 || score > 10) {
      return this.notifications.error(
        'Score must be a number between 0 and 10'
      );
    }

    if (!this.likelihoodInput) {
      return this.notifications.error('Please select a likelihood');
    }

    try {
      await this.ajax.put(`analyses/${this.analysis?.id}/aeis-override`, {
        namespace: ENV.namespace_v2,
        data: JSON.stringify({
          score,
          likelihood: this.likelihoodInput.value,
        }),
      });

      await this.analysis?.reload();

      this.isEditing = false;
      this.notifications.success('AEIS score updated');
    } catch (error) {
      this.notifications.error(parseError(error, 'Please try again'));
    }
  });

  clearOverride = task(async () => {
    try {
      await this.ajax.delete(`analyses/${this.analysis?.id}/aeis-override`, {
        namespace: ENV.namespace_v2,
      });

      await this.analysis?.reload();

      this.isEditing = false;
      this.notifications.success('AEIS override cleared');
    } catch (error) {
      this.notifications.error(parseError(error, 'Please try again'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::AeisScore': typeof SecurityAnalysisDetailsAeisScoreComponent;
  }
}
