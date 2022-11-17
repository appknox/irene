import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import Inflector from 'ember-inflector';
import ENUMS from 'irene/enums';

const inflector = Inflector.inflector;
inflector.irregular('asvs', 'asvses');

export default class SecurityAnalysisModel extends Model {
  @attr() findings;
  @attr('number') risk;
  @attr('string') status; // this is made as string because ember power select considers 0 as null value. ref:https://github.com/cibernox/ember-power-select/issues/962
  @attr() attackVector;
  @attr() attackComplexity;
  @attr() privilegesRequired;
  @attr() userInteraction;
  @attr() scope;
  @attr() confidentialityImpact;
  @attr() integrityImpact;
  @attr() availabilityImpact;
  @attr('string') cvssBase;
  @attr('string') cvssVector;
  @attr('string') cvssVersion;
  @attr('number') analiserVersion;
  @attr('string') overriddenRisk; // this is made as string because ember power select considers 0 as null value. ref:https://github.com/cibernox/ember-power-select/issues/962
  @attr('string') overriddenRiskComment;
  @attr('boolean') overriddenRiskToProfile;
  @attr('string') computedRisk;
  @belongsTo('security/file') file;
  @hasMany('owasp') owasp;
  @hasMany('pcidss') pcidss;
  @hasMany('mstg') mstg;
  @hasMany('asvs') asvs;
  @hasMany('cwe') cwe;
  @hasMany('gdpr') gdpr;
  @hasMany('hipaa') hipaa;
  @hasMany('security/attachment') attachments;
  @belongsTo('vulnerability') vulnerability;

  get isPassed() {
    const risk = this.risk;
    return risk !== ENUMS.RISK.NONE;
  }

  get riskLabelClass() {
    return this.labelClass(this.risk);
  }

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
  }
}
