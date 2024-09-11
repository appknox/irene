import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';

import type ArrayProxy from '@ember/array/proxy';
import type Store from '@ember-data/store';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type OwaspModel from 'irene/models/owasp';
import type OwaspMobile2024Model from 'irene/models/owaspmobile2024';
import type OwaspApi2023Model from 'irene/models/owaspapi2023';
import type PcidssModel from 'irene/models/pcidss';
import type HipaaModel from 'irene/models/hipaa';
import type MstgModel from 'irene/models/mstg';
import type MasvsModel from 'irene/models/masvs';
import type AsvsModel from 'irene/models/asvs';
import type CweModel from 'irene/models/cwe';
import type GdprModel from 'irene/models/gdpr';
import type Nistsp80053Model from 'irene/models/nistsp80053';
import type Nistsp800171Model from 'irene/models/nistsp800171';
import type IntlService from 'ember-intl/services/intl';
import SamaModel from 'irene/models/sama';
import Pcidss4Model from 'irene/models/pcidss4';

type RegulatoryCategoryOptionKeys =
  | 'owasp'
  | 'owaspmobile2024'
  | 'owaspapi2023'
  | 'pcidss'
  | 'pcidss4'
  | 'hipaa'
  | 'masvs'
  | 'mstg'
  | 'asvs'
  | 'cwe'
  | 'gdpr'
  | 'nistsp800171'
  | 'nistsp80053'
  | 'sama';

type RegulatoryCategoryModels =
  | OwaspModel
  | OwaspMobile2024Model
  | OwaspApi2023Model
  | PcidssModel
  | Pcidss4Model
  | HipaaModel
  | MstgModel
  | MasvsModel
  | AsvsModel
  | CweModel
  | GdprModel
  | Nistsp80053Model
  | Nistsp800171Model
  | SamaModel;

type RegulatoryDataModel<T> = ArrayProxy<T> | null;

export interface SecurityAnalysisDetailsRegulatoryCategoriesComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
  };
}

export default class SecurityAnalysisDetailsRegulatoryCategoriesComponent extends Component<SecurityAnalysisDetailsRegulatoryCategoriesComponentSignature> {
  @service declare store: Store;
  @service declare notifications: NotificationService;
  @service declare intl: IntlService;

  @tracked owaspsData: RegulatoryDataModel<OwaspModel> = null;
  @tracked owaspmobile2024sData: RegulatoryDataModel<OwaspMobile2024Model> =
    null;
  @tracked owaspapi2023sData: RegulatoryDataModel<OwaspApi2023Model> = null;
  @tracked pcidssesData: RegulatoryDataModel<PcidssModel> = null;
  @tracked pcidss4sData: RegulatoryDataModel<Pcidss4Model> = null;
  @tracked hipaasData: RegulatoryDataModel<HipaaModel> = null;
  @tracked mstgsData: RegulatoryDataModel<MstgModel> = null;
  @tracked masvsesData: RegulatoryDataModel<MasvsModel> = null;
  @tracked asvsesData: RegulatoryDataModel<AsvsModel> = null;
  @tracked cwesData: RegulatoryDataModel<CweModel> = null;
  @tracked gdprsData: RegulatoryDataModel<GdprModel> = null;
  @tracked nistsp80053sData: RegulatoryDataModel<Nistsp80053Model> = null;
  @tracked nistsp800171sData: RegulatoryDataModel<Nistsp800171Model> = null;
  @tracked samaData: RegulatoryDataModel<SamaModel> = null;

  risks = ENUMS.RISK.CHOICES;

  constructor(
    owner: object,
    args: SecurityAnalysisDetailsRegulatoryCategoriesComponentSignature['Args']
  ) {
    super(owner, args);

    this.loadAllRegulatoryCategoryData.perform();
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get analysis() {
    return this.args.analysis;
  }

  get owaspMobile2024Exists() {
    return !!this.analysis?.owaspmobile2024?.length;
  }

  get pcidssExists() {
    return !!this.analysis?.pcidss?.length;
  }

  get owasps() {
    return this.owaspsData?.slice() || [];
  }

  get owaspapi2023s() {
    return this.owaspapi2023sData?.slice() || [];
  }

  get owaspmobile2024s() {
    return this.owaspmobile2024sData?.slice() || [];
  }

  get pcidsses() {
    return this.pcidssesData?.slice() || [];
  }

  get pcidss4s() {
    return this.pcidss4sData?.slice() || [];
  }

  get hipaas() {
    return this.hipaasData?.slice() || [];
  }

  get mstgs() {
    return this.mstgsData?.slice() || [];
  }

  get masvses() {
    return this.masvsesData?.slice() || [];
  }

  get asvses() {
    return this.asvsesData?.slice() || [];
  }

  get cwes() {
    return this.cwesData?.slice() || [];
  }

  get gdprs() {
    return this.gdprsData?.slice() || [];
  }

  get nistsp80053s() {
    return this.nistsp80053sData?.slice() || [];
  }

  get nistsp800171s() {
    return this.nistsp800171sData?.slice() || [];
  }

  get sama() {
    return this.samaData?.slice() || [];
  }

  get regulatoryCategories() {
    return [
      {
        key: 'owasp',
        title: 'OWASP Category',
        placeholder: 'Select OWASP Categories',
        labelKeys: ['code', 'year', 'title'],
        selected: this.analysis?.owasp.slice(),
        options: this.owasps,
        onChange: this.onCategorySelect('owasp'),
        hidden: this.owaspMobile2024Exists,
      },
      {
        key: 'owaspmobile2024',
        title: 'OWASP Mobile Top 10 (2024)',
        placeholder: 'Select OWASP Mobile Top 10 (2024)',
        labelKeys: ['code', 'year', 'title'],
        selected: this.analysis?.owaspmobile2024.slice(),
        options: this.owaspmobile2024s,
        onChange: this.onCategorySelect('owaspmobile2024'),
      },
      {
        key: 'owaspapi2023',
        title: 'OWASP API TOP 10 (2023)',
        placeholder: 'Select OWASP API TOP 10 (2023)',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.owaspapi2023.slice(),
        options: this.owaspapi2023s,
        onChange: this.onCategorySelect('owaspapi2023'),
      },
      {
        key: 'pcidss',
        title: 'PCI-DSS Risk Category',
        placeholder: 'Select PCI-DSS Risk Category',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.pcidss.slice(),
        options: this.pcidsses,
        onChange: this.onCategorySelect('pcidss'),
      },
      {
        key: 'pcidss4',
        title: 'PCI-DSS Risk Category (v 4.0)',
        placeholder: 'Select PCI-DSS Risk Category (v 4.0)',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.pcidss4.slice(),
        options: this.pcidss4s,
        onChange: this.onCategorySelect('pcidss4'),
        hidden: this.pcidssExists,
      },
      {
        key: 'hipaa',
        title: 'HIPAA Sections',
        placeholder: 'Select HIPAA Sections',
        labelKeys: ['code', 'safeguard', 'title'],
        selected: this.analysis?.hipaa.slice(),
        options: this.hipaas,
        onChange: this.onCategorySelect('hipaa'),
      },
      {
        key: 'masvs',
        title: 'OWASP MASVS (v2) Requirements',
        placeholder: 'Select OWASP MASVS (v2) Requirements',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.masvs.slice(),
        options: this.masvses,
        onChange: this.onCategorySelect('masvs'),
      },
      {
        key: 'mstg',
        title: 'MSTG Requirements',
        placeholder: 'Select MSTG Requirements',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.mstg.slice(),
        options: this.mstgs,
        onChange: this.onCategorySelect('mstg'),
      },
      {
        key: 'asvs',
        title: 'ASVS Requirements',
        placeholder: 'Select ASVS Requirements',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.asvs.slice(),
        options: this.asvses,
        onChange: this.onCategorySelect('asvs'),
      },
      {
        key: 'cwe',
        title: 'CWE Weaknesses',
        placeholder: 'Select CWE Weaknesses',
        labelKeys: ['code', 'url'],
        selected: this.analysis?.cwe.slice(),
        options: this.cwes,
        onChange: this.onCategorySelect('cwe'),
      },
      {
        key: 'gdpr',
        title: 'GDPR Articles',
        placeholder: 'Select GDPR Articles',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.gdpr.slice(),
        options: this.gdprs,
        onChange: this.onCategorySelect('gdpr'),
      },
      {
        key: 'nistsp800171',
        title: 'NIST SP 800-171',
        placeholder: 'Select NIST SP 800-171',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.nistsp800171.slice(),
        options: this.nistsp800171s,
        onChange: this.onCategorySelect('nistsp800171'),
      },
      {
        key: 'nistsp80053',
        title: 'NIST SP 800-53',
        placeholder: 'Select NIST SP 800-53',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.nistsp80053.slice(),
        options: this.nistsp80053s,
        onChange: this.onCategorySelect('nistsp80053'),
      },
      {
        key: 'sama',
        title: 'Saudi Arabian Monetary Authority',
        placeholder: 'Select Saudi Arabian Monetary Authority',
        labelKeys: ['code', 'title'],
        selected: this.analysis?.sama.slice(),
        options: this.sama,
        onChange: this.onCategorySelect('sama'),
      },
    ] as Array<{
      key: string;
      title: string;
      placeholder: string;
      labelKeys: string[];
      selected: Array<RegulatoryCategoryModels>;
      options: Array<RegulatoryCategoryModels>;
      onChange: <T extends RegulatoryCategoryOptionKeys>(
        value: SecurityAnalysisModel[T]
      ) => void;
      hidden?: boolean;
    }>;
  }

  @action onCategorySelect(key: RegulatoryCategoryOptionKeys) {
    return (value: SecurityAnalysisModel[RegulatoryCategoryOptionKeys]) =>
      this.handleCategorySelect(key, value);
  }

  @action handleCategorySelect(
    key: RegulatoryCategoryOptionKeys,
    value: SecurityAnalysisModel[typeof key]
  ) {
    this.analysis?.set(key, value);
  }

  @action getCategoryOptionLabel<T extends RegulatoryCategoryModels>(
    value: T,
    keys: Array<string>
  ) {
    return keys.reduce(
      (currLabel, key) =>
        `${currLabel} ${currLabel ? ' - ' : ''} ${value[key as keyof typeof value]}`,
      ''
    );
  }

  loadAllRegulatoryCategoryData = task(async () => {
    try {
      this.owaspsData = await this.store.findAll('owasp');

      this.owaspmobile2024sData = await this.store.findAll('owaspmobile2024');

      this.owaspapi2023sData = await this.store.findAll('owaspapi2023');

      this.pcidssesData = await this.store.findAll('pcidss');

      this.hipaasData = await this.store.findAll('hipaa');

      this.mstgsData = await this.store.findAll('mstg');

      this.masvsesData = await this.store.findAll('masvs');

      this.asvsesData = await this.store.findAll('asvs');

      this.cwesData = await this.store.findAll('cwe');

      this.gdprsData = await this.store.findAll('gdpr');

      this.nistsp80053sData = await this.store.findAll('nistsp80053');

      this.nistsp800171sData = await this.store.findAll('nistsp800171');

      this.samaData = await this.store.findAll('sama');

      this.pcidss4sData = await this.store.findAll('pcidss4');
    } catch (error) {
      this.notifications.error(parseError(error, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::RegulatoryCategories': typeof SecurityAnalysisDetailsRegulatoryCategoriesComponent;
  }
}
