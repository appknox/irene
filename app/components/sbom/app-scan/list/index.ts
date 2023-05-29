import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';

import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import { SbomAppScanQueryParam } from 'irene/routes/authenticated/dashboard/sbom/app-scans';
import SbomFileModel from 'irene/models/sbom-file';
import SbomProjectModel from 'irene/models/sbom-project';
import parseError from 'irene/utils/parse-error';

export interface SbomAppScanListSignature {
  Args: {
    sbomProject: SbomProjectModel;
    queryParams: SbomAppScanQueryParam;
  };
}

type SbomScanQueryResponse = DS.AdapterPopulatedRecordArray<SbomFileModel> & {
  meta: { count: number };
};

export default class SbomAppScanListComponent extends Component<SbomAppScanListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked sbomFileQueryResponse: SbomScanQueryResponse | null = null;
  @tracked selectedSbomFile: SbomFileModel | null = null;

  // translation variables
  tPleaseTryAgain: string;

  constructor(owner: unknown, args: SbomAppScanListSignature['Args']) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    const { scan_limit, scan_offset } = args.queryParams;

    this.fetchSbomProjectFiles.perform(scan_limit, scan_offset, false);
  }

  get projectName() {
    return this.args.sbomProject.project.get('lastFile')?.get('name');
  }

  get openViewReportDrawer() {
    return Boolean(this.selectedSbomFile);
  }

  @action
  handleViewReportDrawerOpen(sbomFile: SbomFileModel, event: MouseEvent) {
    event.stopPropagation();
    this.selectedSbomFile = sbomFile;
  }

  @action
  handleViewReportDrawerClose() {
    this.selectedSbomFile = null;
  }

  get limit() {
    return Number(this.args.queryParams.scan_limit);
  }

  get offset() {
    return Number(this.args.queryParams.scan_offset);
  }

  get sbomFileList() {
    return this.sbomFileQueryResponse?.toArray() || [];
  }

  get totalSbomScanCount() {
    return this.sbomFileQueryResponse?.meta?.count || 0;
  }

  get hasNoSbomScan() {
    return this.totalSbomScanCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('sbomModule.applicationVersion'),
        component: 'sbom/app-scan/list/app-version',
        width: 100,
      },
      {
        name: this.intl.t('sbomModule.versionCode'),
        component: 'sbom/app-scan/list/version-code',
        width: 80,
      },
      {
        name: this.intl.t('sbomModule.sbomGeneratedOn'),
        component: 'sbom/app-scan/list/generated-on',
        textAlign: 'center',
      },
      {
        name: this.intl.t('status'),
        component: 'sbom/scan-status',
        textAlign: 'center',
      },
      {
        name: this.intl.t('sbomModule.viewReport'),
        component: 'sbom/app-scan/list/view-report',
        textAlign: 'center',
        width: 70,
      },
    ];
  }

  @action
  handleSbomScanClick({ rowValue }: { rowValue: SbomFileModel }) {
    this.router.transitionTo(
      'authenticated.dashboard.sbom.scan-details',
      this.args.sbomProject.id,
      rowValue.id
    );
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.fetchSbomProjectFiles.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.fetchSbomProjectFiles.perform(limit, 0);
  }

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        scan_limit: limit,
        scan_offset: offset,
      },
    });
  }

  fetchSbomProjectFiles = task(
    async (
      limit: string | number,
      offset: string | number,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        this.sbomFileQueryResponse = (await this.store.query('sbom-file', {
          limit,
          offset,
          sbomProjectId: this.args.sbomProject.id,
        })) as SbomScanQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List': typeof SbomAppScanListComponent;
  }
}
