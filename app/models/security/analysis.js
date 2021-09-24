import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';
import Inflector from 'ember-inflector';

const inflector = Inflector.inflector;
inflector.irregular('asvs', 'asvses');

export default Model.extend({
  findings: attr(),
  risk: attr('number'),
  status: attr('string'), // this is made as string because ember power select considers 0 as null value. ref:https://github.com/cibernox/ember-power-select/issues/962
  attackVector: attr(),
  attackComplexity: attr(),
  privilegesRequired: attr(),
  userInteraction: attr(),
  scope: attr(),
  confidentialityImpact: attr(),
  integrityImpact: attr(),
  availabilityImpact: attr(),
  cvssBase: attr('string'),
  cvssVector: attr('string'),
  cvssVersion: attr('string'),
  analiserVersion: attr('number'),
  overriddenRisk: attr('string'), // this is made as string because ember power select considers 0 as null value. ref: https://github.com/cibernox/ember-power-select/issues/962
  overriddenRiskComment: attr('string'),
  overriddenRiskToProfile: attr('boolean'),
  computedRisk: attr('string'),
  file: belongsTo('security/file'),
  owasp: hasMany('owasp'),
  pcidss: hasMany('pcidss'),
  mstg: hasMany('mstg'),
  asvs: hasMany('asvs'),
  cwe: hasMany('cwe'),
  gdpr: hasMany('gdpr'),
  hipaa: hasMany('hipaa'),
  attachments: hasMany('security/attachment'),
  vulnerability: belongsTo('vulnerability'),

  isPassed: computed('risk', function () {
    const risk = this.get('risk');
    return risk !== ENUMS.RISK.NONE;
  }),

  riskLabelClass: computed('risk', function () {
    return this.labelClass(this.get('risk'));
  }),

  labelClass(risk) {
    switch (risk) {
      case ENUMS.RISK.UNKNOWN:
        return `is-progress`;
      case ENUMS.RISK.NONE:
        return `is-success`;
      case ENUMS.RISK.LOW:
        return `is-info`;
      case ENUMS.RISK.MEDIUM:
        return `is-warning`;
      case ENUMS.RISK.HIGH:
        return `is-danger`;
      case ENUMS.RISK.CRITICAL:
        return `is-critical`;
    }
  },
});
