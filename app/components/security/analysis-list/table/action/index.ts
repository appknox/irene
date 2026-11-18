import { action } from '@ember/object';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';

import {
  PASSED_CVSS_V3_METRICS,
  PASSED_CVSS_V3_VECTOR,
  PASSED_CVSS_V4_METRICS,
  PASSED_CVSS_V4_VECTOR,
} from 'irene/utils/cvss-metrics';

import type IntlService from 'ember-intl/services/intl';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type IreneAjaxService from 'irene/services/ajax';
import parseError from 'irene/utils/parse-error';

export interface SecurityAnalysisListTableActionComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel;
  };
}

export default class SecurityAnalysisListTableActionComponent extends Component<SecurityAnalysisListTableActionComponentSignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;

  @tracked showMarkPassedConfirmBox = false;

  CVSS_V4_PASSED_STATE = {
    risk: ENUMS.RISK.NONE,
    status: ENUMS.ANALYSIS_STATUS.COMPLETED,
    cvss_vector: PASSED_CVSS_V4_VECTOR,
    ...PASSED_CVSS_V4_METRICS,
  };

  CVSS_V3_PASSED_STATE = {
    legacy_cvss_risk: ENUMS.RISK.NONE,
    legacy_cvss_vector: PASSED_CVSS_V3_VECTOR,
    legacy_cvss_vector_fields: PASSED_CVSS_V3_METRICS,
  };

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get analysis() {
    return this.args.analysis;
  }

  get showMarkAsPassedButton() {
    return !this.analysis.isPassed;
  }

  @action confirmCallback() {
    this.markAsPassed.perform();

    this.showMarkPassedConfirmBox = false;
  }

  @action closeMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = false;
  }

  @action openMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = true;
  }

  markAsPassed = task(async () => {
    try {
      const url = [ENV.endpoints['analyses'], this.analysis.id].join('/');

      const { cvss_vector, risk, status, ...cvssMetrics } =
        this.CVSS_V4_PASSED_STATE;

      await this.ajax.put(url, {
        namespace: 'api/hudson-api',
        data: JSON.stringify({
          owasp: this.analysis.hasMany('owasp').ids(),
          owaspmobile2024: this.analysis.hasMany('owaspmobile2024').ids(),
          owaspapi2023: this.analysis.hasMany('owaspapi2023').ids(),
          pcidss: this.analysis.hasMany('pcidss').ids(),
          pcidss4: this.analysis.hasMany('pcidss4').ids(),
          hipaa: this.analysis.hasMany('hipaa').ids(),
          masvs: this.analysis.hasMany('masvs').ids(),
          mstg: this.analysis.hasMany('mstg').ids(),
          asvs: this.analysis.hasMany('asvs').ids(),
          cwe: this.analysis.hasMany('cwe').ids(),
          gdpr: this.analysis.hasMany('gdpr').ids(),
          nistsp80053: this.analysis.hasMany('nistsp80053').ids(),
          nistsp800171: this.analysis.hasMany('nistsp800171').ids(),
          sama: this.analysis.hasMany('sama').ids(),
          dora: this.analysis.hasMany('dora').ids(),
          eucra: this.analysis.hasMany('eucra').ids(),
          popia: this.analysis.hasMany('popia').ids(),
          findings: this.analysis.findings,
          overridden_risk: this.analysis.overriddenRisk || 'None',
          overridden_risk_comment: this.analysis.overriddenRiskComment || '',
          overridden_risk_to_profile:
            this.analysis.overriddenRiskToProfile || false,

          cvss_vector: cvss_vector,
          risk: risk,
          status: status,
          active_cvss_vector_fields: cvssMetrics,
          ...this.CVSS_V3_PASSED_STATE,
        }),
      });

      await this.analysis.reload();

      this.notify.success(`Analysis ${this.analysis.id} marked as passed`);
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-list/table/action': typeof SecurityAnalysisListTableActionComponent;
  }
}
