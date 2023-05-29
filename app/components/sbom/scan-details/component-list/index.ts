import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import { debounce } from '@ember/runloop';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';

import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import parseError from 'irene/utils/parse-error';

import SbomProjectModel from 'irene/models/sbom-project';
import SbomFileModel from 'irene/models/sbom-file';
import SbomComponentModel from 'irene/models/sbom-component';
import { SbomComponentQueryParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';
import SbomScanSummaryModel from 'irene/models/sbom-scan-summary';

export interface SbomScanDetailsComponentListSignature {
  Element: HTMLDivElement;
  Args: {
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
    queryParams: SbomComponentQueryParam;
  };
}

type SbomComponentQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomComponentModel> & {
    meta: { count: number };
  };

export default class SbomScanDetailsComponentListComponent extends Component<SbomScanDetailsComponentListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked componentQueryResponse: SbomComponentQueryResponse | null = null;
  @tracked selectedComponent: SbomComponentModel | null = null;

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: SbomScanDetailsComponentListSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    const { component_limit, component_offset, component_query } =
      args.queryParams;

    this.fetchSbomComponents.perform(
      component_limit,
      component_offset,
      component_query,
      false
    );
  }

  get limit() {
    return Number(this.args.queryParams.component_limit);
  }

  get offset() {
    return Number(this.args.queryParams.component_offset);
  }

  get sbomComponentList() {
    return this.componentQueryResponse?.toArray() || [];
  }

  get totalSbomComponentCount() {
    return this.componentQueryResponse?.meta?.count || 0;
  }

  get hasNoSbomComponent() {
    return this.totalSbomComponentCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('sbomModule.componentName'),
        valuePath: 'name',
        width: 150,
      },
      {
        name: this.intl.t('sbomModule.componentType'),
        component: 'sbom/scan-details/component-list/type',
      },
      {
        name: this.intl.t('version'),
        component: 'sbom/scan-details/component-list/version',
        width: 150,
      },
      {
        name: this.intl.t('sbomModule.knownVulnerabilities'),
        component: 'sbom/scan-details/component-list/known-vulnerabilities',
        textAlign: 'center',
      },
    ];
  }

  get openComponentDetailDrawer() {
    return Boolean(this.selectedComponent);
  }

  @action
  handleComponentDetailDrawerClose() {
    this.selectedComponent = null;
  }

  @action
  handleComponentClick({ rowValue }: { rowValue: SbomComponentModel }) {
    this.selectedComponent = rowValue;
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    const { component_query } = this.args.queryParams;

    this.fetchSbomComponents.perform(limit, offset, component_query);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    const { component_query } = this.args.queryParams;

    this.fetchSbomComponents.perform(limit, 0, component_query);
  }

  @action
  searchSbomComponentForQuery(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    debounce(this, this.setSearchQuery, query, 500);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.fetchSbomComponents.perform(this.limit, 0, query);
  }

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        component_limit: limit,
        component_offset: offset,
      },
    });
  }

  fetchSbomComponents = task(
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
        this.componentQueryResponse = (await this.store.query(
          'sbom-component',
          {
            limit,
            offset,
            q: query,
            sbomFileId: this.args.sbomFile.id,
          }
        )) as SbomComponentQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList': typeof SbomScanDetailsComponentListComponent;
  }
}
