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

import SbomAppModel from 'irene/models/sbom-app';
import SbomScanModel from 'irene/models/sbom-scan';
import SbomScanComponentModel from 'irene/models/sbom-scan-component';
import { SbomScanComponentQueryParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';
import SbomScanSummaryModel from 'irene/models/sbom-scan-summary';

export interface SbomScanDetailsComponentListSignature {
  Element: HTMLDivElement;
  Args: {
    sbomApp: SbomAppModel;
    sbomScan: SbomScanModel;
    sbomScanSummary: SbomScanSummaryModel | null;
    queryParams: SbomScanComponentQueryParam;
  };
}

type SbomScanComponentQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomScanComponentModel> & {
    meta: { count: number };
  };

export default class SbomScanDetailsComponentListComponent extends Component<SbomScanDetailsComponentListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked componentQueryResponse: SbomScanComponentQueryResponse | null = null;
  @tracked selectedComponent: SbomScanComponentModel | null = null;

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

    this.fetchSbomScanComponents.perform(
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

  get sbomScanComponentList() {
    return this.componentQueryResponse?.toArray() || [];
  }

  get totalSbomScanComponentCount() {
    return this.componentQueryResponse?.meta?.count || 0;
  }

  get hasNoSbomScanComponent() {
    return this.totalSbomScanComponentCount === 0;
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
  handleComponentClick({ rowValue }: { rowValue: SbomScanComponentModel }) {
    this.selectedComponent = rowValue;
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    const { component_query } = this.args.queryParams;

    this.fetchSbomScanComponents.perform(limit, offset, component_query);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    const { component_query } = this.args.queryParams;

    this.fetchSbomScanComponents.perform(limit, 0, component_query);
  }

  @action
  searchSbomScanComponentForQuery(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    debounce(this, this.setSearchQuery, query, 500);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.fetchSbomScanComponents.perform(this.limit, 0, query);
  }

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        component_limit: limit,
        component_offset: offset,
      },
    });
  }

  fetchSbomScanComponents = task(
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
          'sbom-scan-component',
          {
            limit,
            offset,
            q: query,
            sbomScanId: this.args.sbomScan.id,
          }
        )) as SbomScanComponentQueryResponse;
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
