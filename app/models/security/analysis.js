import DS from 'ember-data';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';

export default DS.Model.extend({
  findings: DS.attr(),
  risk: DS.attr('number'),
  status: DS.attr('string'), // this is made as string because ember power select considers 0 as null value. ref:https://github.com/cibernox/ember-power-select/issues/962
  attackVector: DS.attr(),
  attackComplexity: DS.attr(),
  privilegesRequired: DS.attr(),
  userInteraction: DS.attr(),
  scope: DS.attr(),
  confidentialityImpact: DS.attr(),
  integrityImpact: DS.attr(),
  availabilityImpact: DS.attr(),
  cvssBase: DS.attr('string'),
  cvssVector: DS.attr('string'),
  cvssVersion: DS.attr('string'),
  analiserVersion: DS.attr('number'),
  overriddenRisk: DS.attr('string'), // this is made as string because ember power select considers 0 as null value. ref: https://github.com/cibernox/ember-power-select/issues/962
  overriddenRiskComment: DS.attr('string'),
  overriddenRiskToProfile: DS.attr('boolean'),
  computedRisk: DS.attr('string'),
  file: DS.belongsTo('security/file'),
  owasp: DS.hasMany('owasp'),
  pcidss: DS.hasMany('pcidss'),
  attachments: DS.hasMany('security/attachment'),
  vulnerability: DS.belongsTo('vulnerability'),

  isPassed: computed('risk', function() {
    const risk = this.get("risk");
    return risk !== ENUMS.RISK.NONE;
  }),

  riskLabelClass: computed('risk', function() {
    return this.labelClass(this.get("risk"));
  }),

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
