import type { AsyncBelongsTo, AsyncHasMany } from '@ember-data/model';
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
import { irregular } from '@ember-data/request-utils/string';

import ENUMS from 'irene/enums';
import { riskClass } from 'irene/helpers/risk-class';
export type { RiskLabelClass as SecurityAnalysisRiskLabelClass } from 'irene/helpers/risk-class';

import type DoraModel from '../dora';
import type SecurityFileModel from './file';
import type OwaspModel from '../owasp';
import type OwaspMobile2024Model from '../owaspmobile2024';
import type OwaspApi2023Model from '../owaspapi2023';
import type PcidssModel from '../pcidss';
import type MstgModel from '../mstg';
import type MasvsModel from '../masvs';
import type AsvsModel from '../asvs';
import type CweModel from '../cwe';
import type GdprModel from '../gdpr';
import type HipaaModel from '../hipaa';
import type SecurityAttachmentModel from './attachment';
import type VulnerabilityModel from '../vulnerability';
import type Nistsp80053Model from '../nistsp80053';
import type Nistsp800171Model from '../nistsp800171';
import type SamaModel from '../sama';
import type Pcidss4Model from '../pcidss4';

irregular('asvs', 'asvses');

export interface SecurityAnalysisFinding {
  id?: number;
  title: string | null;
  description: string;
}

export interface CvssV3Metrics {
  attack_vector: string | number;
  attack_complexity: string | number;
  privileges_required: string | number;
  user_interaction: string | number;
  scope: string | number;
  confidentiality_impact: string | number;
  integrity_impact: string | number;
  availability_impact: string | number;
}

export interface CvssV4Metrics {
  attack_vector: string | number;
  attack_complexity: string | number;
  attack_requirements: string | number;
  privileges_required: string | number;
  user_interaction: string | number;
  vuln_confidentiality: string | number;
  vuln_integrity: string | number;
  vuln_availability: string | number;
  subsequent_confidentiality: string | number;
  subsequent_integrity: string | number;
  subsequent_availability: string | number;
}

export default class SecurityAnalysisModel extends Model {
  @attr
  declare findings: SecurityAnalysisFinding[];

  @attr('number')
  declare risk: number;

  @attr('number')
  declare status: number;

  @attr('number')
  declare cvssBase: number;

  @attr('string') declare cvssVector: string;
  @attr('number') declare cvssVersion: number;

  @attr('number')
  declare activeCvssVersion: number | null;

  @attr()
  declare cvssMetrics: CvssV3Metrics | CvssV4Metrics | null;

  @attr('number')
  declare legacyCvssBase: number;

  @attr('string')
  declare legacyCvssVector: string;

  @attr('number')
  declare legacyCvssVersion: number | null;

  @attr('number')
  declare legacyCvssRisk: number;

  @attr()
  declare legacyCvssMetrics: CvssV3Metrics | CvssV4Metrics | null;
  @attr('number') declare analiserVersion: number;

  @attr('number', { defaultValue: null }) declare overriddenRisk: number;

  @attr('string') declare overriddenRiskComment: string;
  @attr('boolean') declare overriddenRiskToProfile: boolean;
  @attr('string') declare computedRisk: string;

  @belongsTo('security/file', { async: true, inverse: 'analyses' })
  declare file: AsyncBelongsTo<SecurityFileModel>;

  @belongsTo('vulnerability', { async: true, inverse: null })
  declare vulnerability: AsyncBelongsTo<VulnerabilityModel>;

  @hasMany('owasp', { async: true, inverse: null })
  declare owasp: AsyncHasMany<OwaspModel>;

  @hasMany('owaspmobile2024', { async: true, inverse: null })
  declare owaspmobile2024: AsyncHasMany<OwaspMobile2024Model>;

  @hasMany('owaspapi2023', { async: true, inverse: null })
  declare owaspapi2023: AsyncHasMany<OwaspApi2023Model>;

  @hasMany('pcidss', { async: true, inverse: null })
  declare pcidss: AsyncHasMany<PcidssModel>;

  @hasMany('pcidss4', { async: true, inverse: null })
  declare pcidss4: AsyncHasMany<Pcidss4Model>;

  @hasMany('mstg', { async: true, inverse: null })
  declare mstg: AsyncHasMany<MstgModel>;

  @hasMany('masvs', { async: true, inverse: null })
  declare masvs: AsyncHasMany<MasvsModel>;

  @hasMany('asvs', { async: true, inverse: null })
  declare asvs: AsyncHasMany<AsvsModel>;

  @hasMany('cwe', { async: true, inverse: null })
  declare cwe: AsyncHasMany<CweModel>;

  @hasMany('gdpr', { async: true, inverse: null })
  declare gdpr: AsyncHasMany<GdprModel>;

  @hasMany('hipaa', { async: true, inverse: null })
  declare hipaa: AsyncHasMany<HipaaModel>;

  @hasMany('nistsp80053', { async: true, inverse: null })
  declare nistsp80053: AsyncHasMany<Nistsp80053Model>;

  @hasMany('nistsp800171', { async: true, inverse: null })
  declare nistsp800171: AsyncHasMany<Nistsp800171Model>;

  @hasMany('sama', { async: true, inverse: null })
  declare sama: AsyncHasMany<SamaModel>;

  @hasMany('dora', { async: true, inverse: null })
  declare dora: AsyncHasMany<DoraModel>;

  @hasMany('security/attachment', { async: true, inverse: null })
  declare attachments: AsyncHasMany<SecurityAttachmentModel>;

  get isPassed() {
    return this.risk === ENUMS.RISK.NONE;
  }

  get riskLabelClass() {
    return this.labelClass(this.risk);
  }

  labelClass(risk: number) {
    return riskClass([risk]);
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
