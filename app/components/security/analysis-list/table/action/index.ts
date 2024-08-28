import { action } from '@ember/object';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';

import type IntlService from 'ember-intl/services/intl';
import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisListTableActionComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel;
  };
}

export default class SecurityAnalysisListTableActionComponent extends Component<SecurityAnalysisListTableActionComponentSignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;
  @service declare ajax: any;

  @tracked showMarkPassedConfirmBox = false;

  PASSED_STATE = {
    risk: ENUMS.RISK.NONE,
    status: ENUMS.ANALYSIS_STATUS.COMPLETED,
    cvss_vector: 'CVSS:3.0/AV:P/AC:H/PR:H/UI:R/S:U/C:N/I:N/A:N',
    attack_vector: ENUMS.ATTACK_VECTOR.PHYSICAL,
    attack_complexity: ENUMS.ATTACK_COMPLEXITY.HIGH,
    privileges_required: ENUMS.PRIVILEGES_REQUIRED.HIGH,
    user_interaction: ENUMS.USER_INTERACTION.REQUIRED,
    scope: ENUMS.SCOPE.UNCHANGED,
    confidentiality_impact: ENUMS.CONFIDENTIALITY_IMPACT.NONE,
    integrity_impact: ENUMS.INTEGRITY_IMPACT.NONE,
    availability_impact: ENUMS.AVAILABILITY_IMPACT.NONE,
  };

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get analysis() {
    return this.args.analysis;
  }

  @action confirmCallback() {
    this.markAsPassed.perform();

    this.showMarkPassedConfirmBox = false;
  }

  @action openMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = true;
  }

  markAsPassed = task(async () => {
    try {
      const url = [ENV.endpoints['analyses'], this.analysis.id].join('/');

      await this.ajax.put(url, {
        namespace: 'api/hudson-api',
        contentType: 'application/json',
        data: JSON.stringify({
          ...this.PASSED_STATE,
          owasp: this.analysis.owasp.map((a) => a.get('id')),
          owaspmobile2024: this.analysis.owaspmobile2024.map((a) =>
            a.get('id')
          ),
          owaspapi2023: this.analysis.owaspapi2023.map((a) => a.get('id')),
          pcidss: this.analysis.pcidss.map((a) => a.get('id')),
          pcidss4: this.analysis.pcidss4.map((a) => a.get('id')),
          hipaa: this.analysis.hipaa.map((a) => a.get('id')),
          masvs: this.analysis.masvs.map((a) => a.get('id')),
          mstg: this.analysis.mstg.map((a) => a.get('id')),
          asvs: this.analysis.asvs.map((a) => a.get('id')),
          cwe: this.analysis.cwe.map((a) => a.get('id')),
          gdpr: this.analysis.gdpr.map((a) => a.get('id')),
          nistsp80053: this.analysis.nistsp80053.map((a) => a.get('id')),
          nistsp800171: this.analysis.nistsp800171.map((a) => a.get('id')),
          sama: this.analysis.sama.map((a) => a.get('id')),
          findings: this.analysis.findings,
          overridden_risk: this.analysis.overriddenRisk || 'None',
          overridden_risk_comment: this.analysis.overriddenRiskComment || '',
          overridden_risk_to_profile:
            this.analysis.overriddenRiskToProfile || false,
        }),
      });

      this.analysis.setProperties({
        risk: this.PASSED_STATE.risk,
        status: this.PASSED_STATE.status,
        cvssVector: this.PASSED_STATE.cvss_vector,
        attackVector: this.PASSED_STATE.attack_vector,
        attackComplexity: this.PASSED_STATE.attack_complexity,
        privilegesRequired: this.PASSED_STATE.privileges_required,
        userInteraction: this.PASSED_STATE.user_interaction,
        scope: this.PASSED_STATE.scope,
        confidentialityImpact: this.PASSED_STATE.confidentiality_impact,
        integrityImpact: this.PASSED_STATE.integrity_impact,
        availabilityImpact: this.PASSED_STATE.availability_impact,
      });

      this.notify.success(`Analysis ${this.analysis.id} marked as passed`);
    } catch (err) {
      const error = err as AdapterError;
      let errMsg = this.tPleaseTryAgain;

      if (error.errors && error.errors.length) {
        errMsg = error.errors[0]?.detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-list/table/action': typeof SecurityAnalysisListTableActionComponent;
  }
}
