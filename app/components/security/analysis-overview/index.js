import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';

export default class AnalysisOverviewComponent extends Component {
  @service ajax;
  @service intl;
  @service('notifications') notify;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

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

  get analysis() {
    return this.args.analysis || null;
  }

  get tags() {
    const types = this.analysis.vulnerability.get('types');
    if (types === undefined) {
      return [];
    }

    const tags = [];
    for (let type of Array.from(types)) {
      if (type === ENUMS.VULNERABILITY_TYPE.STATIC) {
        tags.push({
          status: this.analysis.file.get('isStaticDone'),
          text: 'static',
        });
      }
      if (type === ENUMS.VULNERABILITY_TYPE.DYNAMIC) {
        tags.push({
          status: this.analysis.file.get('isDynamicDone'),
          text: 'dynamic',
        });
      }
      if (type === ENUMS.VULNERABILITY_TYPE.MANUAL) {
        tags.push({
          status: this.analysis.file.get('manual') == ENUMS.MANUAL.DONE,
          text: 'manual',
        });
      }
      if (type === ENUMS.VULNERABILITY_TYPE.API) {
        tags.push({
          status: this.analysis.file.get('isApiDone'),
          text: 'api',
        });
      }
    }
    return tags;
  }

  get overridenRisk() {
    return this.analysis.overriddenRisk;
  }

  get riskIsOverriden() {
    return this.overridenRisk !== null;
  }

  @action confirmCallback() {
    this.markAsPassed.perform();
    this.showMarkPassedConfirmBox = false;
  }

  @action openMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = true;
  }

  @task(function* () {
    try {
      const url = [ENV.endpoints.analyses, this.analysis.id].join('/');
      yield this.ajax.put(url, {
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
          hipaa: this.analysis.hipaa.map((a) => a.get('id')),
          masvs: this.analysis.masvs.map((a) => a.get('id')),
          mstg: this.analysis.mstg.map((a) => a.get('id')),
          asvs: this.analysis.asvs.map((a) => a.get('id')),
          cwe: this.analysis.cwe.map((a) => a.get('id')),
          gdpr: this.analysis.gdpr.map((a) => a.get('id')),
          nistsp80053: this.analysis.nistsp80053.map((a) => a.get('id')),
          nistsp800171: this.analysis.nistsp800171.map((a) => a.get('id')),
          findings: this.analysis.findings,
          overridden_risk: this.analysis.overridden_risk || 'None',
          overridden_risk_comment: this.analysis.overridden_risk_comment || '',
          overridden_risk_to_profile:
            this.analysis.overridden_risk_to_profile || false,
        }),
      });

      this.analysis.risk = this.PASSED_STATE.risk;
      this.analysis.status = this.PASSED_STATE.status;
      this.analysis.cvssVector = this.PASSED_STATE.cvss_vector;
      this.analysis.attackVector = this.PASSED_STATE.attack_vector;
      this.analysis.attackComplexity = this.PASSED_STATE.attack_complexity;
      this.analysis.privilegesRequired = this.PASSED_STATE.privileges_required;
      this.analysis.userInteraction = this.PASSED_STATE.user_interaction;
      this.analysis.scope = this.PASSED_STATE.scope;
      this.analysis.confidentialityImpact =
        this.PASSED_STATE.confidentiality_impact;
      this.analysis.integrityImpact = this.PASSED_STATE.integrity_impact;
      this.analysis.availabilityImpact = this.PASSED_STATE.availability_impact;

      this.notify.success(`Analysis ${this.analysis.id} marked as passed`);
    } catch (error) {
      let errMsg = this.tPleaseTryAgain;
      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }
      this.notify.error(errMsg);
    }
  })
  markAsPassed;
}
