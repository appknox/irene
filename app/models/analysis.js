import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
import Inflector from 'ember-inflector';
import { t } from 'ember-intl';
import ENUMS from 'irene/enums';

const inflector = Inflector.inflector;
inflector.irregular('asvs', 'asvses');

export default class Analysis extends Model {
  @attr() findings;
  @attr('number') risk;
  @attr('number') status;

  @attr('number') cvssBase;
  @attr('string') cvssVector;
  @attr('number') cvssVersion;
  @attr() cvssMetricsHumanized;
  @attr('number') computedRisk;
  @attr('number') overriddenRisk;
  @attr('string') overriddenRiskComment;
  @attr('number') analiserVersion;

  @hasMany('attachment') attachments;
  @hasMany('owasp') owasp;
  @hasMany('cwe') cwe;
  @hasMany('asvs') asvs;
  @hasMany('mstg') mstg;
  @hasMany('pcidss') pcidss;
  @hasMany('hipaa') hipaa;
  @hasMany('gdpr') gdpr;

  @belongsTo('vulnerability') vulnerability;
  @belongsTo('file', { inverse: 'analyses' }) file;

  tLow = t('low');
  tNone = t('none');
  tHigh = t('high');
  tMedium = t('medium');
  tCritical = t('critical');

  labelClass(risk) {
    const cls = 'tag';
    switch (risk) {
      case ENUMS.RISK.UNKNOWN:
        return `${cls} is-progress`;
      case ENUMS.RISK.NONE:
        return `${cls} is-success`;
      case ENUMS.RISK.LOW:
        return `${cls} is-info`;
      case ENUMS.RISK.MEDIUM:
        return `${cls} is-warning`;
      case ENUMS.RISK.HIGH:
        return `${cls} is-danger`;
      case ENUMS.RISK.CRITICAL:
        return `${cls} is-critical`;
    }
  }

  hasType(type) {
    const types = this.vulnerability.get('types');
    if (isEmpty(types)) {
      return false;
    }
    return types.includes(type);
  }

  iconClass(risk) {
    switch (risk) {
      case ENUMS.RISK.UNKNOWN:
        return 'fa-spinner fa-spin';
      case ENUMS.RISK.NONE:
        return 'fa-check';
      case ENUMS.RISK.CRITICAL:
      case ENUMS.RISK.HIGH:
      case ENUMS.RISK.LOW:
      case ENUMS.RISK.MEDIUM:
        return 'fa-warning';
    }
  }

  get hasCvssBase() {
    return this.cvssVersion === 3;
  }

  get isOverriddenRisk() {
    return !isEmpty(this.overriddenRisk);
  }

  get isScanning() {
    const risk = this.computedRisk;
    return risk === ENUMS.RISK.UNKNOWN;
  }

  get isRisky() {
    const risk = this.computedRisk;
    return ![ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN].includes(risk);
  }

  get riskIconClass() {
    return this.iconClass(this.risk);
  }

  get overriddenRiskIconClass() {
    return this.iconClass(this.overriddenRisk);
  }

  get computedRiskIconClass() {
    return this.iconClass(this.computedRisk);
  }

  get riskLabelClass() {
    return this.labelClass(this.risk);
  }

  get overriddenRiskLabelClass() {
    return this.labelClass(this.overriddenRisk);
  }

  get showPcidss() {
    return this.file.profile.reportPreference.show_pcidss.value;
  }
  get showHipaa() {
    return this.file.profile.reportPreference.show_hipaa.value;
  }
  get showGdpr() {
    return this.file.profile.reportPreference.show_gdpr.value;
  }

  get vulnerabilityTypes() {
    return this.vulnerability.get('types');
  }
}
