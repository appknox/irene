import Model, {
  attr,
  hasMany,
  belongsTo,
  AsyncBelongsTo,
  AsyncHasMany,
} from '@ember-data/model';
import Inflector from 'ember-inflector';

import ENUMS from 'irene/enums';
import SecurityFileModel from './file';
import OwaspModel from '../owasp';
import OwaspApi2023Model from '../owaspapi2023';
import PcidssModel from '../pcidss';
import MstgModel from '../mstg';
import MasvsModel from '../masvs';
import AsvsModel from '../asvs';
import CweModel from '../cwe';
import GdprModel from '../gdpr';
import HipaaModel from '../hipaa';
import SecurityAttachmentModel from './attachment';
import VulnerabilityModel from '../vulnerability';

const inflector = Inflector.inflector;
inflector.irregular('asvs', 'asvses');

export default class SecurityAnalysisModel extends Model {
  @attr()
  declare findings: unknown;

  @attr('number')
  declare risk: number;

  // this is made as string because ember power select considers 0 as null value. ref:https://github.com/cibernox/ember-power-select/issues/962
  @attr('string')
  declare status: string;

  @attr()
  declare attackVector: unknown;

  @attr()
  declare attackComplexity: unknown;

  @attr()
  declare privilegesRequired: unknown;

  @attr()
  declare userInteraction: unknown;

  @attr()
  declare scope: unknown;

  @attr()
  declare confidentialityImpact: unknown;

  @attr()
  declare integrityImpact: unknown;

  @attr()
  declare availabilityImpact: unknown;

  @attr('string')
  declare cvssBase: string;

  @attr('string') declare cvssVector: string;
  @attr('string') declare cvssVersion: string;
  @attr('number') declare analiserVersion: number;

  // this is made as string because ember power select considers 0 as null value. ref: https://github.com/cibernox/ember-power-select/issues/962
  @attr('string') declare overriddenRisk: string;

  @attr('string') declare overriddenRiskComment: string;
  @attr('boolean') declare overriddenRiskToProfile: boolean;
  @attr('string') declare computedRisk: string;

  @belongsTo('security/file')
  declare file: AsyncBelongsTo<SecurityFileModel>;

  @belongsTo('vulnerability')
  declare vulnerability: AsyncBelongsTo<VulnerabilityModel>;

  @hasMany('owasp')
  declare owasp: AsyncHasMany<OwaspModel>;

  @hasMany('owaspapi2023')
  declare owaspapi2023: AsyncHasMany<OwaspApi2023Model>;

  @hasMany('pcidss')
  declare pcidss: AsyncHasMany<PcidssModel>;

  @hasMany('mstg')
  declare mstg: AsyncHasMany<MstgModel>;

  @hasMany('masvs')
  declare masvs: AsyncHasMany<MasvsModel>;

  @hasMany('asvs')
  declare asvs: AsyncHasMany<AsvsModel>;

  @hasMany('cwe')
  declare cwe: AsyncHasMany<CweModel>;

  @hasMany('gdpr')
  declare gdpr: AsyncHasMany<GdprModel>;

  @hasMany('hipaa')
  declare hipaa: AsyncHasMany<HipaaModel>;

  @hasMany('security/attachment')
  declare attachments: AsyncHasMany<SecurityAttachmentModel>;

  get isPassed() {
    const risk = this.risk;
    return risk !== ENUMS.RISK.NONE;
  }

  get riskLabelClass() {
    return this.labelClass(this.risk);
  }

  labelClass(risk: number) {
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

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/analysis': SecurityAnalysisModel;
  }
}
