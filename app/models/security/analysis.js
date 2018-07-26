import DS from 'ember-data';
import ENUMS from 'irene/enums';

export default DS.Model.extend({
  findings: DS.attr(),
  risk: DS.attr('number'),
  status: DS.attr('number'),
  attackVector: DS.attr('string'),
  attackComplexity: DS.attr('string'),
  privilegesRequired: DS.attr('string'),
  userInteraction: DS.attr('string'),
  scope: DS.attr('string'),
  confidentialityImpact: DS.attr('string'),
  integrityImpact: DS.attr('string'),
  availabilityImpact: DS.attr('string'),
  cvssBase: DS.attr('string'),
  cvssVector: DS.attr('string'),
  cvssVersion: DS.attr('string'),
  analiserVersion: DS.attr('number'),
  overriddenRisk: DS.attr('number'),
  overriddenRiskToProfile: DS.attr('boolean'),
  file: DS.belongsTo('security/file'),
  owasp: DS.hasMany('security/owasp'),
  pcidss: DS.hasMany('security/pcidss'),
  attachments: DS.hasMany('security/attachment'),
  vulnerability: DS.belongsTo('security/vulnerability'),

  isPassed: (function() {
    const risk = this.get("risk");
    return risk !== ENUMS.RISK.NONE;
  }).property("risk"),

  riskLabelClass: (function() {
    return this.labelClass(this.get("risk"));
  }).property("risk"),

  labelClass(risk) {
    switch (risk) {
      case ENUMS.RISK.UNKNOWN: return `is-progress`;
      case ENUMS.RISK.NONE: return `is-success`;
      case ENUMS.RISK.LOW: return `is-info`;
      case ENUMS.RISK.MEDIUM: return `is-warning`;
      case ENUMS.RISK.HIGH: return `is-danger`;
      case ENUMS.RISK.CRITICAL: return `is-critical`;
    }
  }

});
