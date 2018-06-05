import DS from 'ember-data';
import ENUMS from 'irene/enums';
import Ember from 'ember';

const Analysis = DS.Model.extend({
  findings: DS.attr(),
  risk: DS.attr('number'),
  status: DS.attr('number'),
  owasp: DS.hasMany('owasp'),
  cvssBase: DS.attr('number'),
  pcidss: DS.hasMany('pcidss'),
  cvssVector: DS.attr('string'),
  cvssVersion: DS.attr('number'),
  cvssMetricsHumanized: DS.attr(),
  computedRisk: DS.attr('number'),
  overriddenRisk: DS.attr('number'),
  analiserVersion: DS.attr('number'),
  attachments: DS.hasMany('attachment'),
  vulnerability: DS.belongsTo('vulnerability'),
  file: DS.belongsTo('file', {inverse: 'analyses'}),


  hascvccBase: Ember.computed.equal('cvssVersion', 3),

  tLow: t("low"),
  tNone: t("none"),
  tHigh: t("high"),
  tMedium: t("medium"),
  tCritical: t("critical"),

  isOverriddenRisk: Ember.computed.notEmpty('overriddenRisk'),

  isScanning: ( function() {
    const risk = this.get("computedRisk");
    return risk === ENUMS.RISK.UNKNOWN;
  }).property("computedRisk"),

  hasType(type) {
    const types = this.get("vulnerability.types");
    if (Ember.isEmpty(types)) {
      return false;
    }
    return types.includes(type);
  },

  isRisky: (function() {
    const risk = this.get("computedRisk");
    return ![ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN].includes(risk);
  }).property("computedRisk"),

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

  overriddenRiskIconClass: (function() {
    return this.iconClass(this.get("overriddenRisk"));
  }).property("overriddenRisk"),

  riskLabelClass: (function() {
    return this.labelClass(this.get("risk"));
  }).property("risk"),

  overriddenRiskLabelClass: (function() {
    return this.labelClass(this.get("overriddenRisk"));
  }).property("overriddenRisk"),

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

  riskText:( function() {
    const tNone = this.get("tNone");
    const tLow = this.get("tLow");
    const tMedium = this.get("tMedium");
    const tHigh = this.get("tHigh");
    const tCritical = this.get("tCritical");

    switch (this.get("risk")) {
      case ENUMS.RISK.NONE: return tNone;
      case ENUMS.RISK.LOW: return tLow;
      case ENUMS.RISK.MEDIUM: return tMedium;
      case ENUMS.RISK.HIGH: return tHigh;
      case ENUMS.RISK.CRITICAL: return tCritical;
    }
  }).property("risk")
});

export default Analysis;
