import { action } from '@ember/object';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { PASSED_CVSS_V4_METRICS } from 'irene/utils/cvss-metrics';

import type IntlService from 'ember-intl/services/intl';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type IreneAjaxService from 'irene/services/ajax';

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
    cvss_vector:
      'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N',
    ...PASSED_CVSS_V4_METRICS,
  };

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get analysis() {
    return this.args.analysis;
  }

  get analysisCVSSVersionIsLegacy() {
    return (
      this.analysis.activeCvssVersion !== null &&
      this.analysis.activeCvssVersion !== this.analysis.cvssVersion
    );
  }

  @action confirmCallback() {
    this.markAsPassed.perform();

    this.showMarkPassedConfirmBox = false;
  }

  @action closeMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = false;
  }

  @action openMarkPassedConfirmBox() {
    if (this.analysisCVSSVersionIsLegacy) {
      this.notify.error(
        'You cannot mark an analysis with legacy CVSS as passed. Please update the CVSS version in the analysis details page to the latest version (CVSS v4) and try again.'
      );

      return;
    }

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
          owasp: (await this.analysis.owasp).map((a) => a.get('id')),
          owaspmobile2024: (await this.analysis.owaspmobile2024).map((a) =>
            a.get('id')
          ),
          owaspapi2023: (await this.analysis.owaspapi2023).map((a) =>
            a.get('id')
          ),
          pcidss: (await this.analysis.pcidss).map((a) => a.get('id')),
          pcidss4: (await this.analysis.pcidss4).map((a) => a.get('id')),
          hipaa: (await this.analysis.hipaa).map((a) => a.get('id')),
          masvs: (await this.analysis.masvs).map((a) => a.get('id')),
          mstg: (await this.analysis.mstg).map((a) => a.get('id')),
          asvs: (await this.analysis.asvs).map((a) => a.get('id')),
          cwe: (await this.analysis.cwe).map((a) => a.get('id')),
          gdpr: (await this.analysis.gdpr).map((a) => a.get('id')),
          nistsp80053: (await this.analysis.nistsp80053).map((a) =>
            a.get('id')
          ),
          nistsp800171: (await this.analysis.nistsp800171).map((a) =>
            a.get('id')
          ),
          sama: (await this.analysis.sama).map((a) => a.get('id')),
          dora: (await this.analysis.dora).map((a) => a.get('id')),
          findings: this.analysis.findings,
          overridden_risk: this.analysis.overriddenRisk || 'None',
          overridden_risk_comment: this.analysis.overriddenRiskComment || '',
          overridden_risk_to_profile:
            this.analysis.overriddenRiskToProfile || false,

          cvss_vector: cvss_vector,
          risk: risk,
          status: status,
          legacy_cvss_risk: this.analysis.legacyCvssRisk,
          legacy_cvss_vector: this.analysis.legacyCvssVector,
          active_cvss_vector_fields: cvssMetrics,
          legacy_cvss_vector_fields: this.analysis.legacyCvssMetrics,
        }),
      });

      await this.analysis.reload();
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
