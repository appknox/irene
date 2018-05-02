import DS from 'ember-data';
import ENUMS from 'irene/enums';
import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';


const Analysis = DS.Model.extend({
  i18n: Ember.inject.service(),
  file: DS.belongsTo('file', {inverse: 'analyses'}),
  findings: DS.attr(),
  attachments: DS.hasMany('attachment'),
  analiserVersion: DS.attr('number'),
  risk: DS.attr('number'),
  status: DS.attr('number'),
  vulnerability: DS.belongsTo('vulnerability'),
  cvssBase: DS.attr('number'),
  cvssVector: DS.attr('string'),
  cvssVersion: DS.attr('number'),
  cvssMetricsHumanized: DS.attr(),
  owasp: DS.hasMany('owasp'),
  isIgnored: DS.attr('boolean'),
  overridenRisk: DS.attr('boolean'),

  hascvccBase: Ember.computed.equal('cvssVersion', 3),

  tScanning: t("scanning"),
  tNone: t("none"),
  tLow: t("low"),
  tMedium: t("medium"),
  tHigh: t("high"),
  tCritical: t("critical"),

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

  iconClass: (function() {
    switch (this.get("risk")) {
      case ENUMS.RISK.UNKNOWN: return "fa-spinner fa-spin";
      case ENUMS.RISK.NONE: return "fa-check";
      case ENUMS.RISK.CRITICAL: case ENUMS.RISK.HIGH: case ENUMS.RISK.LOW: case ENUMS.RISK.MEDIUM:  return "fa-warning";
    }
  }).property("risk"),

  labelClass:( function() {
    const cls = 'tag';
    switch (this.get("risk")) {
      case ENUMS.RISK.UNKNOWN: return `${cls} is-progress`;
      case ENUMS.RISK.NONE: return `${cls} is-success`;
      case ENUMS.RISK.LOW: return `${cls} is-info`;
      case ENUMS.RISK.MEDIUM: return `${cls} is-warning`;
      case ENUMS.RISK.HIGH: return `${cls} is-danger`;
      case ENUMS.RISK.CRITICAL: return `${cls} is-critical`;
    }
  }).property("risk"),

  riskText:( function() {
    const tScanning = this.get("tScanning");
    const tNone = this.get("tNone");
    const tLow = this.get("tLow");
    const tMedium = this.get("tMedium");
    const tHigh = this.get("tHigh");
    const tCritical = this.get("tCritical");

    switch (this.get("risk")) {
      case ENUMS.RISK.UNKNOWN: return tScanning;
      case ENUMS.RISK.NONE: return tNone;
      case ENUMS.RISK.LOW: return tLow;
      case ENUMS.RISK.MEDIUM: return tMedium;
      case ENUMS.RISK.HIGH: return tHigh;
      case ENUMS.RISK.CRITICAL: return tCritical;
    }
  }).property("risk")

});

export default Analysis;
