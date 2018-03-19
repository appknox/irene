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
  }).property("risk"),

  categories: (function() {
    const OWASPMap = {
      "1_2013": "Improper Platform Usage", "2_2013": "Insecure Data Storage", "3_2013": "Insecure Communication", "4_2013": "Insecure Authentication",
      "5_2013": "Insufficient Cryptography", "6_2013": "Insecure Authorization", "7_2013": "Client Code Quality", "8_2013": "Code Tampering",
      "9_2013": "Reverse Engineering", "10_2013": "Extraneous Functionality", "11_2013": "Injection", "12_2013": "Broken Authentication and Session Management",
      "13_2013": "Cross Site Scripting", "14_2013": "IDOR", "15_2013": "Security Misconfiguration", "16_2013": "Sensitive Data Exposure",
      "17_2013": "Missing function ACL", "18_2013": "CSRF", "19_2013": "Using components with known vulns", "20_2013": "Unvalidated Redirects"
    };
    const owaspCategories = this.get("owasp");
    if (owaspCategories === undefined) { return []; }
    const categories = [];
    for (let owaspCategory of owaspCategories) {
      let initialKey = "M";
      if (owaspCategory > ENUMS.OWASP_CATEGORIES.M10_2013) {
        initialKey = "A";
      }
      const OWASPDict = {
        key: `${initialKey}${owaspCategory.split("_")[0]}`,
        description: OWASPMap[owaspCategory]
      };
      categories.push(OWASPDict);
    }
    return categories;
  }).property("owasp")

});

export default Analysis;
