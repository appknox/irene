import Model, {
  attr,
  hasMany,
  belongsTo,
  AsyncBelongsTo,
  AsyncHasMany,
} from '@ember-data/model';
import Inflector from 'ember-inflector';
import { isEmpty } from '@ember/utils';

import ENUMS from 'irene/enums';
import SecurityFileModel from './file';
import OwaspModel from '../owasp';
import OwaspMobile2024Model from '../owaspmobile2024';
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
import Nistsp80053Model from '../nistsp80053';
import Nistsp800171Model from '../nistsp800171';

const inflector = Inflector.inflector;
inflector.irregular('asvs', 'asvses');

export interface SecurityAnalysisFinding {
  id?: number;
  title: string | null;
  description: string;
}

export default class SecurityAnalysisModel extends Model {
  @attr
  declare findings: SecurityAnalysisFinding[];

  @attr
  declare attackVector: 'N' | 'A' | 'L' | 'P' | number;

  @attr
  declare attackComplexity: 'L' | 'H' | number;

  @attr
  declare privilegesRequired: 'N' | 'L' | 'H' | number;

  @attr
  declare userInteraction: 'R' | 'N' | number;

  @attr
  declare scope: 'C' | 'U' | number;

  @attr
  declare confidentialityImpact: 'N' | 'L' | 'H' | number;

  @attr
  declare integrityImpact: 'N' | 'L' | 'H' | number;

  @attr
  declare availabilityImpact: 'N' | 'L' | 'H' | number;

  @attr('number')
  declare risk: number;

  @attr('number')
  declare status: number;

  @attr('string')
  declare cvssBase: string | number;

  @attr('string') declare cvssVector: string;
  @attr('string') declare cvssVersion: string;
  @attr('number') declare analiserVersion: number;

  @attr('number', { defaultValue: null }) declare overriddenRisk: number;

  @attr('string') declare overriddenRiskComment: string;
  @attr('boolean') declare overriddenRiskToProfile: boolean;
  @attr('string') declare computedRisk: string;

  @belongsTo('security/file')
  declare file: AsyncBelongsTo<SecurityFileModel>;

  @belongsTo('vulnerability')
  declare vulnerability: AsyncBelongsTo<VulnerabilityModel>;

  @hasMany('owasp')
  declare owasp: AsyncHasMany<OwaspModel>;

  @hasMany('owaspmobile2024')
  declare owaspmobile2024: AsyncHasMany<OwaspMobile2024Model>;

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

  @hasMany('nistsp80053')
  declare nistsp80053: AsyncHasMany<Nistsp80053Model>;

  @hasMany('nistsp800171')
  declare nistsp800171: AsyncHasMany<Nistsp800171Model>;

  @hasMany('security/attachment')
  declare attachments: AsyncHasMany<SecurityAttachmentModel>;

  get isPassed() {
    return this.risk === ENUMS.RISK.NONE;
  }

  get riskLabelClass() {
    return this.labelClass(this.risk);
  }

  labelClass(risk: number) {
    switch (risk) {
      case ENUMS.RISK.UNKNOWN:
        return 'is-progress';

      case ENUMS.RISK.NONE:
        return 'is-success';

      case ENUMS.RISK.LOW:
        return 'is-info';

      case ENUMS.RISK.MEDIUM:
        return 'is-warning';

      case ENUMS.RISK.HIGH:
        return 'is-danger';

      case ENUMS.RISK.CRITICAL:
        return 'is-critical';
    }
  }

  hasType(type: number) {
    const types = this.vulnerability.get('types');

    if (isEmpty(types)) {
      return false;
    }

    return types?.includes(type);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/analysis': SecurityAnalysisModel;
  }
}
