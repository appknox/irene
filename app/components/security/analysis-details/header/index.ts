import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';

import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsHeaderComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    updateCVSSScore(): void;
    updateAnalysis(): Promise<void>;
  };
}

export default class SecurityAnalysisDetailsHeaderComponent extends Component<SecurityAnalysisDetailsHeaderComponentSignature> {
  @service declare intl: IntlService;
  @service declare notifications: NotificationService;

  @tracked showMarkPassedConfirmBox = false;

  statuses = ENUMS.ANALYSIS_STATUS.CHOICES;

  get analysis() {
    return this.args.analysis;
  }

  get analysisStatus() {
    return this.statuses.find((s) => s.value === this.analysis?.status);
  }

  get ireneFilePath() {
    if (this.analysis?.file) {
      const fileId = this.analysis.file.get('id');
      const ireneHost = ENV['ireneHost'];

      return [ireneHost, 'dashboard/file', fileId].join('/');
    }

    return '';
  }

  @action selectStatus(param: { value: SecurityAnalysisModel['status'] }) {
    this.analysis?.set('status', param.value);
  }

  @action openMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = true;
  }

  @action closeMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = false;
  }

  @action triggerMarkAsPassed() {
    this.markAsPassed.perform();
  }

  markAsPassed = task(async () => {
    try {
      this.analysis?.setProperties({
        confidentialityImpact: ENUMS.CONFIDENTIALITY_IMPACT.NONE,
        attackVector: ENUMS.ATTACK_VECTOR.PHYSICAL,
        attackComplexity: ENUMS.ATTACK_COMPLEXITY.HIGH,
        privilegesRequired: ENUMS.PRIVILEGES_REQUIRED.HIGH,
        userInteraction: ENUMS.USER_INTERACTION.REQUIRED,
        scope: ENUMS.SCOPE.UNCHANGED,
        integrityImpact: ENUMS.INTEGRITY_IMPACT.NONE,
        availabilityImpact: ENUMS.AVAILABILITY_IMPACT.NONE,
        cvssVector: 'CVSS:3.0/AV:P/AC:H/PR:H/UI:R/S:U/C:N/I:N/A:N',
      });

      this.args.updateCVSSScore();

      this.analysis?.set('status', ENUMS.ANALYSIS_STATUS.COMPLETED);

      await this.args.updateAnalysis();

      this.notifications.success('Analysis Updated');

      this.closeMarkPassedConfirmBox();
    } catch (error) {
      this.notifications.error(
        parseError(error, this.intl.t('pleaseTryAgain'))
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Header': typeof SecurityAnalysisDetailsHeaderComponent;
  }
}
