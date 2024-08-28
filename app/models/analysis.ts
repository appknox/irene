import Model, {
  AsyncBelongsTo,
  AsyncHasMany,
  attr,
  belongsTo,
  hasMany,
} from '@ember-data/model';

import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Inflector from 'ember-inflector';
import IntlService from 'ember-intl/services/intl';
import ENUMS from 'irene/enums';
import AsvsModel from './asvs';
import AttachmentModel from './attachment';
import CweModel from './cwe';
import FileModel from './file';
import GdprModel from './gdpr';
import HipaaModel from './hipaa';
import MstgModel from './mstg';
import OwaspModel from './owasp';
import OwaspMobile2024Model from './owaspmobile2024';
import PcidssModel from './pcidss';
import MasvsModel from './masvs';
import VulnerabilityModel from './vulnerability';
import OwaspApi2023Model from './owaspapi2023';
import Nistsp800171Model from './nistsp800171';
import Nistsp80053Model from './nistsp80053';
import SamaModel from './sama';
import Pcidss4Model from './pcidss4';

const inflector = Inflector.inflector;
inflector.irregular('asvs', 'asvses');

export interface CvssMetricHumanized {
  key: string;
  value: string;
}

export interface Finding {
  title: string | null;
  description: string;
}

export default class AnalysisModel extends Model {
  @service declare intl: IntlService;

  @attr
  declare findings: Finding[];

  @attr('number')
  declare risk: number;

  @attr('number')
  declare status: number;

  @attr('number')
  declare cvssBase: number;

  @attr('string')
  declare cvssVector: string;

  @attr('number')
  declare cvssVersion: number;

  @attr
  declare cvssMetricsHumanized: CvssMetricHumanized[];

  @attr('number')
  declare computedRisk: number;

  @attr('number', { defaultValue: null })
  declare overriddenRisk: number | null;

  @attr('string', { defaultValue: null })
  declare overriddenRiskComment: string | null;

  @attr('string', { defaultValue: null })
  declare overrideCriteria: string | null;

  @attr('string', { defaultValue: null })
  declare overriddenBy: string | null;

  @attr('date')
  declare overriddenDate: Date | null;

  @attr('number')
  declare analiserVersion: string;

  @hasMany('attachment')
  declare attachments: AsyncHasMany<AttachmentModel>;

  @hasMany('owasp')
  declare owasp: AsyncHasMany<OwaspModel>;

  @hasMany('owaspmobile2024')
  declare owaspmobile2024: AsyncHasMany<OwaspMobile2024Model>;

  @hasMany('owaspapi2023')
  declare owaspapi2023: AsyncHasMany<OwaspApi2023Model>;

  @hasMany('cwe')
  declare cwe: AsyncHasMany<CweModel>;

  @hasMany('asvs')
  declare asvs: AsyncHasMany<AsvsModel>;

  @hasMany('masvs')
  declare masvs: AsyncHasMany<MasvsModel>;

  @hasMany('mstg')
  declare mstg: AsyncHasMany<MstgModel>;

  @hasMany('pcidss')
  declare pcidss: AsyncHasMany<PcidssModel>;

  @hasMany('pcidss4')
  declare pcidss4: AsyncHasMany<Pcidss4Model>;

  @hasMany('hipaa')
  declare hipaa: AsyncHasMany<HipaaModel>;

  @hasMany('gdpr')
  declare gdpr: AsyncHasMany<GdprModel>;

  @hasMany('nistsp800171')
  declare nistsp800171: AsyncHasMany<Nistsp800171Model>;

  @hasMany('nistsp80053')
  declare nistsp80053: AsyncHasMany<Nistsp80053Model>;

  @hasMany('sama')
  declare sama: AsyncHasMany<SamaModel>;

  @belongsTo('vulnerability')
  declare vulnerability: AsyncBelongsTo<VulnerabilityModel>;

  @belongsTo('file', { inverse: 'analyses' })
  declare file: AsyncBelongsTo<FileModel>;

  @attr('date')
  declare updatedOn: Date;

  get tLow() {
    return this.intl.t('low');
  }

  get tNone() {
    return this.intl.t('none');
  }
  get tHigh() {
    return this.intl.t('high');
  }

  get tMedium() {
    return this.intl.t('medium');
  }

  get tCritical() {
    return this.intl.t('critical');
  }

  labelClass(risk: number | null) {
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

  hasType(type: number) {
    const types = this.vulnerability.get('types');

    if (isEmpty(types)) {
      return false;
    }

    return types?.includes(type);
  }

  iconClass(risk: number | null) {
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

  /**
   * Risk was overridden and not passed by system
   * This is used to show overridden icon
   */
  get isNonPassedRiskOverridden() {
    return this.isOverriddenRisk && !this.isRiskPassedBySystem;
  }

  get isRiskPassedBySystem() {
    return this.risk === ENUMS.RISK.NONE;
  }

  get isScanning() {
    const risk = this.computedRisk;
    return risk === ENUMS.RISK.UNKNOWN;
  }

  get isRisky() {
    const risk = this.computedRisk;
    return ![ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN].includes(risk);
  }

  /**
   * Risk was overridden as Passed and not passed by system
   */
  get isOverriddenAsPassed() {
    return (
      this.overriddenRisk === ENUMS.RISK.NONE && !this.isRiskPassedBySystem
    );
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
    return this.file.get('profile')?.get('reportPreference')?.show_pcidss
      ?.value;
  }

  get showHipaa() {
    return this.file.get('profile')?.get('reportPreference')?.show_hipaa?.value;
  }

  get showGdpr() {
    return this.file.get('profile')?.get('reportPreference')?.show_gdpr?.value;
  }

  get showNist() {
    return this.file.get('profile')?.get('reportPreference')?.show_nist?.value;
  }

  get showSama() {
    return this.file.get('profile')?.get('reportPreference')?.show_sama?.value;
  }

  get vulnerabilityTypes() {
    return this.vulnerability.get('types');
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    analysis: AnalysisModel;
  }
}
