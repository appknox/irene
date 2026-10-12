import { action } from '@ember/object';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';

import ENV from 'irene/config/environment';

import {
  SECURITY_ANALYSIS_AEIS_PASSED_OVERRIDE,
  aeisOverrideUrl,
} from 'irene/utils/security-aeis';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';
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
import type OrganizationService from 'irene/services/organization';
import type Store from 'ember-data/store';
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
  @service declare organization: OrganizationService;
  @service declare store: Store;

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
    if (!this.analysis.isPassed) {
      return true;
    }

    return this.isKnoxIqAnalysis && !this.analysis.hasPassedAeisOverride;
  }

  get isKnoxIqAnalysis() {
    return Boolean(
      this.organization.isKnoxIqEnabled && this.analysis.isKnoxIqAnalysis
    );
  }

  get markPassedConfirmDescription() {
    return this.isKnoxIqAnalysis
      ? this.intl.t(
          'securityAnalysisDetails.header.markAsPassedDeletesFindings'
        )
      : '';
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

  /**
   * Mirrors the canonical passed CVSS vector onto AEIS. The backend has no
   * concept of marking an analysis passed, so the dashboard writes it.
   */
  async applyPassedAeisOverride() {
    const analysis = this.analysis;

    if (
      analysis?.exploitabilityScore === null ||
      analysis?.exploitabilityScore === undefined
    ) {
      return;
    }

    await this.ajax.put(aeisOverrideUrl(analysis.id), {
      namespace: ENV.namespace_v2,
      data: JSON.stringify(SECURITY_ANALYSIS_AEIS_PASSED_OVERRIDE),
    });

    await analysis.reload();
  }

  /**
   * A passed analysis has nothing left to validate. The deletes run in
   * sequence so a partial failure surfaces rather than leaving the rest in
   * flight.
   */
  async deleteValidatedFindings() {
    const analysis = this.analysis;

    if (!analysis?.isKnoxIqAnalysis) {
      return;
    }

    const findings = await this.store.query('security/validated-finding', {
      analysisId: analysis.id,
    });

    const adapterOptions = { analysisId: String(analysis.id) };

    for (const finding of findings.slice()) {
      await (finding as SecurityValidatedFindingModel).destroyRecord({
        adapterOptions,
      });
    }
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
          eucra: (await this.analysis.eucra).map((a) => a.get('id')),
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

      await this.applyPassedAeisOverride();
      await this.deleteValidatedFindings();

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
