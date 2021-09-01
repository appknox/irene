import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import Model, { attr, hasMany, belongsTo }  from '@ember-data/model';
import ENUMS from 'irene/enums';
import { t } from 'ember-intl';
import Inflector from  'ember-inflector';

const inflector = Inflector.inflector;
inflector.irregular('asvs', 'asvses');

const Analysis = Model.extend({
  findings: attr(),
  risk: attr('number'),
  status: attr('number'),
  owasp: hasMany('owasp'),
  hipaa: hasMany('hipaa'),
  cvssBase: attr('number'),
  pcidss: hasMany('pcidss'),
  mstg: hasMany('mstg'),
  asvs: hasMany('asvs'),
  cwe: hasMany('cwe'),
  gdpr: hasMany('gdpr'),
  cvssVector: attr('string'),
  cvssVersion: attr('number'),
  cvssMetricsHumanized: attr(),
  computedRisk: attr('number'),
  overriddenRisk: attr('number'),
  overriddenRiskComment: attr('string'),
  analiserVersion: attr('number'),
  attachments: hasMany('attachment'),
  vulnerability: belongsTo('vulnerability'),
  file: belongsTo('file', {inverse: 'analyses'}),


  hascvccBase: computed.equal('cvssVersion', 3),

  tLow: t("low"),
  tNone: t("none"),
  tHigh: t("high"),
  tMedium: t("medium"),
  tCritical: t("critical"),

  isOverriddenRisk: computed.notEmpty('overriddenRisk'),

  isScanning: computed('computedRisk', function() {
    const risk = this.get("computedRisk");
    return risk === ENUMS.RISK.UNKNOWN;
  }),

  hasType(type) {
    const types = this.get("vulnerability.types");
    if (isEmpty(types)) {
      return false;
    }
    return types.includes(type);
  },

  isRisky: computed('computedRisk', function() {
    const risk = this.get("computedRisk");
    return ![ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN].includes(risk);
  }),

  iconClass(risk) {
    switch (risk) {
      case ENUMS.RISK.UNKNOWN: return "fa-spinner fa-spin";
      case ENUMS.RISK.NONE: return "fa-check";
      case ENUMS.RISK.CRITICAL: case ENUMS.RISK.HIGH: case ENUMS.RISK.LOW: case ENUMS.RISK.MEDIUM:  return "fa-warning";
    }
  },

  riskIconClass: computed('risk', function() {
    return this.iconClass(this.get("risk"));
  }),

  overriddenRiskIconClass: computed('overriddenRisk', function() {
    return this.iconClass(this.get("overriddenRisk"));
  }),

  computedRiskIconClass: computed('computedRisk', function() {
    return this.iconClass(this.get("computedRisk"));
  }),

  riskLabelClass: computed('risk', function() {
    return this.labelClass(this.get("risk"));
  }),

  overriddenRiskLabelClass: computed('overriddenRisk', function() {
    return this.labelClass(this.get("overriddenRisk"));
  }),

  showPcidss: computed.reads('file.profile.reportPreference.show_pcidss.value'),

  showHipaa: computed.reads('file.profile.reportPreference.show_hipaa.value'),

  showAsvs: computed.reads('file.profile.reportPreference.show_asvs.value'),

  showCwe: computed.reads('file.profile.reportPreference.show_cwe.value'),

  showMstg: computed.reads('file.profile.reportPreference.show_mstg.value'),

  labelClass(risk) {
    const cls = 'tag';
    switch (risk) {
      case ENUMS.RISK.UNKNOWN: return `${cls} is-progress`;
      case ENUMS.RISK.NONE: return `${cls} is-success`;
      case ENUMS.RISK.LOW: return `${cls} is-info`;
      case ENUMS.RISK.MEDIUM: return `${cls} is-warning`;
      case ENUMS.RISK.HIGH: return `${cls} is-danger`;
      case ENUMS.RISK.CRITICAL: return `${cls} is-critical`;
    }
  }
});

export default Analysis;
