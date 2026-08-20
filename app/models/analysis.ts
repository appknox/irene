import type { AsyncBelongsTo, AsyncHasMany } from '@ember-data/model';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { irregular } from '@ember-data/request-utils/string';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import { riskClass } from 'irene/helpers/risk-class';
import type AsvsModel from './asvs';
import type AttachmentModel from './attachment';
import type CweModel from './cwe';
import type FileModel from './file';
import type GdprModel from './gdpr';
import type HipaaModel from './hipaa';
import type MstgModel from './mstg';
import type OwaspModel from './owasp';
import type OwaspMobile2024Model from './owaspmobile2024';
import type PcidssModel from './pcidss';
import type MasvsModel from './masvs';
import type VulnerabilityModel from './vulnerability';
import type OwaspApi2023Model from './owaspapi2023';
import type Nistsp800171Model from './nistsp800171';
import type Nistsp80053Model from './nistsp80053';
import type SamaModel from './sama';
import type Pcidss4Model from './pcidss4';
import type DoraModel from './dora';
import type { KnoxiqValidatedFindingExploitability } from './knoxiq-validated-finding';

irregular('asvs', 'asvses');

export interface CvssMetricHumanized {
  key: string;
  value: string;
}

export interface LegacyCvss {
  version: number;
  vector: string;
  base: number;
  risk: number;
  metrics_humanized: CvssMetricHumanized[];
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

  @attr('number')
  declare activeCvssVersion: number;

  @attr
  declare legacyCvss: LegacyCvss | null;

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
  declare analiserVersion: number;

  @hasMany('attachment', { async: true, inverse: null })
  declare attachments: AsyncHasMany<AttachmentModel>;

  @hasMany('owasp', { async: true, inverse: null })
  declare owasp: AsyncHasMany<OwaspModel>;

  @hasMany('owaspmobile2024', { async: true, inverse: null })
  declare owaspmobile2024: AsyncHasMany<OwaspMobile2024Model>;

  @hasMany('owaspapi2023', { async: true, inverse: null })
  declare owaspapi2023: AsyncHasMany<OwaspApi2023Model>;

  @hasMany('cwe', { async: true, inverse: null })
  declare cwe: AsyncHasMany<CweModel>;

  @hasMany('asvs', { async: true, inverse: null })
  declare asvs: AsyncHasMany<AsvsModel>;

  @hasMany('masvs', { async: true, inverse: null })
  declare masvs: AsyncHasMany<MasvsModel>;

  @hasMany('mstg', { async: true, inverse: null })
  declare mstg: AsyncHasMany<MstgModel>;

  @hasMany('pcidss', { async: true, inverse: null })
  declare pcidss: AsyncHasMany<PcidssModel>;

  @hasMany('pcidss4', { async: true, inverse: null })
  declare pcidss4: AsyncHasMany<Pcidss4Model>;

  @hasMany('hipaa', { async: true, inverse: null })
  declare hipaa: AsyncHasMany<HipaaModel>;

  @hasMany('gdpr', { async: true, inverse: null })
  declare gdpr: AsyncHasMany<GdprModel>;

  @hasMany('nistsp800171', { async: true, inverse: null })
  declare nistsp800171: AsyncHasMany<Nistsp800171Model>;

  @hasMany('nistsp80053', { async: true, inverse: null })
  declare nistsp80053: AsyncHasMany<Nistsp80053Model>;

  @hasMany('sama', { async: true, inverse: null })
  declare sama: AsyncHasMany<SamaModel>;

  @hasMany('dora', { async: true, inverse: null })
  declare dora: AsyncHasMany<DoraModel>;

  @belongsTo('vulnerability', { async: true, inverse: null })
  declare vulnerability: AsyncBelongsTo<VulnerabilityModel>;

  @belongsTo('file', { inverse: null, async: true })
  declare file: AsyncBelongsTo<FileModel>;

  @attr('number')
  declare exploitabilityScore: number;

  @attr('number')
  declare exploitabilityLikelihood: number;

  @attr()
  declare exploitability: KnoxiqValidatedFindingExploitability;

  @attr('date')
  declare updatedOn: Date;

  @attr('boolean')
  declare isKnoxiqAllFp: boolean;

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
    return `tag ${riskClass([risk])}`;
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

  get isOverriddenRisk() {
    return !isEmpty(this.overriddenRisk);
  }

  get isLegacyCvss() {
    return this.activeCvssVersion !== this.cvssVersion;
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

  get showDora() {
    return this.file.get('profile')?.get('reportPreference')?.show_dora?.value;
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
