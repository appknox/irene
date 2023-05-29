import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';

import { SbomAppQueryParam } from 'irene/routes/authenticated/dashboard/sbom/apps';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import SbomProjectModel from 'irene/models/sbom-project';
import parseError from 'irene/utils/parse-error';
import SbomFileModel from 'irene/models/sbom-file';

type SbomProjectQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomProjectModel> & {
    meta: { count: number };
  };

export interface SbomAppListSignature {
  Args: {
    queryParams: SbomAppQueryParam;
  };
}

export default class SbomAppListComponent extends Component<SbomAppListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked sbomProjectQueryResponse: SbomProjectQueryResponse | null = null;
  @tracked selectedSbomFile: SbomFileModel | null = null;
  @tracked showNoScanAlert = false;

  // translation variables
  tPleaseTryAgain: string;

  constructor(owner: unknown, args: SbomAppListSignature['Args']) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    const { app_limit, app_offset, app_query } = args.queryParams;

    this.fetchSbomProjects.perform(app_limit, app_offset, app_query, false);
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get sbomProjectList() {
    return this.sbomProjectQueryResponse?.toArray() || [];
  }

  get totalSbomProjectCount() {
    return this.sbomProjectQueryResponse?.meta?.count || 0;
  }

  get hasNoSbomProject() {
    return this.totalSbomProjectCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('platform'),
        component: 'sbom/app-platform',
        width: 40,
      },
      {
        name: this.intl.t('sbomModule.applicationName'),
        component: 'sbom/app-list/app-name',
        width: 200,
      },
      {
        name: this.intl.t('sbomModule.lastSbomAnalysisOn'),
        component: 'sbom/app-list/last-analysed-on',
        textAlign: 'center',
      },
      {
        name: this.intl.t('status'),
        component: 'sbom/scan-status',
        textAlign: 'center',
      },
      {
        name: this.intl.t('action'),
        component: 'sbom/app-list/action',
        textAlign: 'center',
        width: 40,
      },
    ];
  }

  @action
  handleNoScanAlertClose() {
    this.showNoScanAlert = false;
  }

  get openViewReportDrawer() {
    return Boolean(this.selectedSbomFile);
  }

  @action
  async handleViewReportOpen(sbomProject: SbomProjectModel) {
    this.selectedSbomFile = await sbomProject.latestSbFile;
  }

  @action
  handleViewReportClose() {
    this.selectedSbomFile = null;
  }

  @action
  handleSbomProjectRowClick({ rowValue }: { rowValue: SbomProjectModel }) {
    const scanId = rowValue.latestSbFile?.get('id');

    if (scanId) {
      this.router.transitionTo(
        'authenticated.dashboard.sbom.scan-details',
        rowValue.id,
        scanId
      );
    } else {
      this.showNoScanAlert = true;
    }
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    const { app_query } = this.args.queryParams;

    this.fetchSbomProjects.perform(limit, offset, app_query);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    const { app_query } = this.args.queryParams;

    this.fetchSbomProjects.perform(limit, 0, app_query);
  }

  @action
  searchSbomProjectForQuery(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    debounce(this, this.setSearchQuery, query, 500);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.fetchSbomProjects.perform(this.limit, 0, query);
  }

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }

  fetchSbomProjects = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      query: string,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        this.sbomProjectQueryResponse = (await this.store.query(
          'sbom-project',
          {
            limit,
            offset,
            q: query,
          }
        )) as SbomProjectQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList': typeof SbomAppListComponent;
  }
}
