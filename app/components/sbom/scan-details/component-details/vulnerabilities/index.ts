import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Store from '@ember-data/store';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import parseError from 'irene/utils/parse-error';

import SbomComponentModel from 'irene/models/sbom-component';
import SbomFileModel from 'irene/models/sbom-file';
import SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';
import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomScanDetailsComponentDetailsVulnerabilitiesSignature {
  Element: HTMLDivElement;
  Args: {
    sbomComponent: SbomComponentModel | null;
    sbomFile: SbomFileModel;
    sbomProject: SbomProjectModel;
  };
}

type SbomVulnerabilityQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomVulnerabilityAuditModel> & {
    meta: { count: number };
  };

export default class SbomScanDetailsComponentDetailsVulnerabilitiesComponent extends Component<SbomScanDetailsComponentDetailsVulnerabilitiesSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked limit = 10;
  @tracked offset = 0;

  @tracked
  componentVulnerabilityQueryResponse: SbomVulnerabilityQueryResponse | null =
    null;

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: SbomScanDetailsComponentDetailsVulnerabilitiesSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.fetchSbomComponentVulnerabilities.perform(this.limit, this.offset);
  }

  get sbomVulnerabilityList() {
    return this.componentVulnerabilityQueryResponse?.toArray() || [];
  }

  get totalSbomVulnerabilityCount() {
    return this.componentVulnerabilityQueryResponse?.meta?.count || 0;
  }

  get hasNoSbomVulnerability() {
    return this.totalSbomVulnerabilityCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('sbomModule.vulnerabilityId'),
        component:
          'sbom/scan-details/component-details/vulnerabilities/vulnerability-id',
        width: 150,
      },
      {
        name: this.intl.t('sbomModule.cvssV3Score'),
        component:
          'sbom/scan-details/component-details/vulnerabilities/cvss-score',
      },
      {
        name: this.intl.t('sbomModule.severity'),
        component:
          'sbom/scan-details/component-details/vulnerabilities/severity',
        textAlign: 'center',
      },
    ];
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.fetchSbomComponentVulnerabilities.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = 0;

    this.fetchSbomComponentVulnerabilities.perform(limit, this.offset);
  }

  fetchSbomComponentVulnerabilities = task(
    async (limit: string | number, offset: string | number) => {
      try {
        this.componentVulnerabilityQueryResponse = (await this.store.query(
          'sbom-vulnerability-audit',
          {
            limit,
            offset,
            sbomComponentId: this.args.sbomComponent?.id,
          }
        )) as SbomVulnerabilityQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentDetails::Vulnerabilities': typeof SbomScanDetailsComponentDetailsVulnerabilitiesComponent;
    'sbom/scan-details/component-details/vulnerabilities': typeof SbomScanDetailsComponentDetailsVulnerabilitiesComponent;
  }
}
