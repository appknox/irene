import Component from '@ember/component';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: ['tr'],
  analysis: null,

  tags: computed(
    "analysis.vulnerability.types",
    "analysis.file.{isStaticDone,isDynamicDone,isApiDone,manual}",
    function () {
      const types = this.get("analysis.vulnerability.types");
      if (types === undefined) { return []; }
      const tags = [];
      for (let type of Array.from(types)) {
        if (type === ENUMS.VULNERABILITY_TYPE.STATIC) {
          tags.push({
            status: this.get("analysis.file.isStaticDone"),
            text: "static"
          });
        }
        if (type === ENUMS.VULNERABILITY_TYPE.DYNAMIC) {
          tags.push({
            status: this.get("analysis.file.isDynamicDone"),
            text: "dynamic"
          });
        }
        if (type === ENUMS.VULNERABILITY_TYPE.MANUAL) {
          tags.push({
            status: this.get("analysis.file.manual") == ENUMS.MANUAL.DONE,
            text: "manual"
          });
        }
        if (type === ENUMS.VULNERABILITY_TYPE.API) {
          tags.push({
            status: this.get("analysis.file.isApiDone"),
            text: "api"
          });
        }
      }
      return tags;
    }
  ),

  PASSED_STATE: {
    risk: ENUMS.RISK.NONE,
    status: ENUMS.ANALYSIS_STATUS.COMPLETED,
    cvss_vector: "CVSS:3.0/AV:P/AC:H/PR:H/UI:R/S:U/C:N/I:N/A:N",
    attack_vector: ENUMS.ATTACK_VECTOR.PHYSICAL,
    attack_complexity: ENUMS.ATTACK_COMPLEXITY.HIGH,
    privileges_required: ENUMS.PRIVILEGES_REQUIRED.HIGH,
    user_interaction: ENUMS.USER_INTERACTION.REQUIRED,
    scope: ENUMS.SCOPE.UNCHANGED,
    confidentiality_impact: ENUMS.CONFIDENTIALITY_IMPACT.NONE,
    integrity_impact: ENUMS.INTEGRITY_IMPACT.NONE,
    availability_impact: ENUMS.AVAILABILITY_IMPACT.NONE,
  },

  markAsPassed: task(function* () {
    const url = [ENV.endpoints.analyses, this.get("analysis.id")].join('/');
    yield this.get("ajax").put(url, {
      namespace: 'api/hudson-api',
      contentType: 'application/json',
      data: JSON.stringify({
        ...this.get('PASSED_STATE'),
        owasp: this.get("analysis.owasp").map(a=>a.get('id')),
        pcidss: this.get("analysis.pcidss").map(a=>a.get('id')),
        hipaa: this.get("analysis.hipaa").map(a=>a.get('id')),
        mstg: this.get("analysis.mstg").map(a=>a.get('id')),
        asvs: this.get("analysis.asvs").map(a=>a.get('id')),
        cwe: this.get("analysis.cwe").map(a=>a.get('id')),
        gdpr: this.get("analysis.gdpr").map(a=>a.get('id')),
        findings: this.get('analysis.findings'),
        overridden_risk: this.get('analysis.overridden_risk') || "None",
        overridden_risk_comment: this.get('analysis.overridden_risk_comment') || "",
        overridden_risk_to_profile: this.get('analysis.overridden_risk_to_profile') || false,
      }),
    });

  }).evented(),

  markAsPassedSucceeded: on('markAsPassed:succeeded', function() {
    this.set('analysis.risk', this.get('PASSED_STATE.risk'));
    this.set('analysis.status', this.get('PASSED_STATE.status'));
    this.set('analysis.cvssVector', this.get('PASSED_STATE.cvss_vector'));
    this.set('analysis.attackVector', this.get('PASSED_STATE.attack_vector'));
    this.set('analysis.attackComplexity', this.get('PASSED_STATE.attack_complexity'));
    this.set('analysis.privilegesRequired', this.get('PASSED_STATE.privileges_required'));
    this.set('analysis.userInteraction', this.get('PASSED_STATE.user_interaction'));
    this.set('analysis.scope', this.get('PASSED_STATE.scope'));
    this.set('analysis.confidentialityImpact', this.get('PASSED_STATE.confidentiality_impact'));
    this.set('analysis.integrityImpact', this.get('PASSED_STATE.integrity_impact'));
    this.set('analysis.availabilityImpact', this.get('PASSED_STATE.availability_impact'));

    this.get('notify').success(`Analysis ${this.get('analysis.id')} marked as passed`);
  }),

  markAsPassedErrored: on('markAsPassed:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }
    this.get("notify").error(errMsg);
  }),

  confirmCallback() {
    this.get("markAsPassed").perform();
    return this.set("showMarkPassedConfirmBox", false);
  },

  actions: {
    openMarkPassedConfirmBox() {
      this.set("showMarkPassedConfirmBox", true);
    },
  }
});
