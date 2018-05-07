import DS from 'ember-data';
import ENUMS from 'irene/enums';
import Ember from 'ember';

const Analysis = DS.Model.extend({
  findings: DS.attr(),
  risk: DS.attr('number'),
  status: DS.attr('number'),
  owasp: DS.hasMany('owasp'),
  cvssBase: DS.attr('number'),
  cvssVector: DS.attr('string'),
  isIgnored: DS.attr('boolean'),
  cvssVersion: DS.attr('number'),
  cvssMetricsHumanized: DS.attr(),
  overridenRisk: DS.attr('number'),
  analiserVersion: DS.attr('number'),
  attachments: DS.hasMany('attachment'),
  vulnerability: DS.belongsTo('vulnerability'),
  file: DS.belongsTo('file', {inverse: 'analyses'}),

  isNotIgnored: Ember.computed.not('isIgnored'),

  hascvccBase: Ember.computed.equal('cvssVersion', 3),

  isOverridenRisk: Ember.computed.notEmpty('overridenRisk'),

  isScanning: ( function() {
    const risk = this.get("risk");
    return risk === ENUMS.RISK.UNKNOWN;
  }).property("risk"),

  hasType(type) {
    const types = this.get("vulnerability.types");
    if (Ember.isEmpty(types)) {
      return false;
    }
    return types.includes(type);
  },

  isRisky: (function() {
    const risk = this.get("risk");
    return ![ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN].includes(risk);
  }).property("risk"),

  iconClass(risk) {
    switch (risk) {
      case ENUMS.RISK.UNKNOWN: return "fa-spinner fa-spin";
      case ENUMS.RISK.NONE: return "fa-check";
      case ENUMS.RISK.CRITICAL: case ENUMS.RISK.HIGH: case ENUMS.RISK.LOW: case ENUMS.RISK.MEDIUM:  return "fa-warning";
    }
  },

  riskIconClass: (function() {
    return this.iconClass(this.get("risk"));
  }).property("risk"),

  overridenRiskIconClass: (function() {
    return this.iconClass(this.get("overridenRisk"));
  }).property("overridenRisk"),

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
  },

  riskLabelClass: (function() {
    return this.labelClass(this.get("risk"));
  }).property("risk"),

  overridenRiskLabelClass: (function() {
    return this.labelClass(this.get("overridenRisk"));
  }).property("overridenRisk"),

  ignoredAnalysisClass: (function() {
    if(this.get("isIgnored")) {
      return "is-ignored-analysis"
    }
  }).property("isIgnored")

});

export default Analysis;
