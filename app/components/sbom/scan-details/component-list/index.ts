import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import parseError from 'irene/utils/parse-error';

import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomFileModel from 'irene/models/sbom-file';
import type SbomComponentModel from 'irene/models/sbom-component';
import type { SbomComponentQueryParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';
import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';

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

const COMPONENT_TYPE_NAMES = [
  'framework',
  'library',
  'file',
  'machine-learning-model',
];

export default class SbomScanDetailsComponentListComponent extends Component<SbomScanDetailsComponentListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked componentQueryResponse: SbomComponentQueryResponse | null = null;
  @tracked selectedDependencyType: boolean | null = null;
  @tracked selectedComponentType: number = -1;

  // translation variables
  tPleaseTryAgain: string;
  tNoComponentsFound: string;
  tNoComponentsFoundFilter: string;

  constructor(
    owner: unknown,
    args: SbomScanDetailsComponentListSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.tNoComponentsFound = this.intl.t(
      'sbomModule.componentListEmptyText.title'
    );
    this.tNoComponentsFoundFilter = this.intl.t(
      'sbomModule.noComponentsFoundFilter'
    );

    const {
      component_limit,
      component_offset,
      component_query,
      component_type,
      is_dependency,
    } = args.queryParams;

    this.selectedComponentType = COMPONENT_TYPE_NAMES.indexOf(
      component_type || ''
    );
    this.selectedDependencyType =
      is_dependency === 'true'
        ? true
        : is_dependency === 'false'
          ? false
          : null;

    this.fetchSbomComponents.perform(
      component_limit,
      component_offset,
      component_query,
      false,
      this.selectedDependencyType,
      component_type ?? null
    );
  }

  get limit() {
    return Number(this.args.queryParams.component_limit);
  }

  get offset() {
    return Number(this.args.queryParams.component_offset);
  }

  get sbomComponentList() {
    return this.componentQueryResponse?.slice() || [];
  }

  get totalSbomComponentCount() {
    return this.componentQueryResponse?.meta?.count || 0;
  }

  get hasNoSbomComponent() {
    return this.totalSbomComponentCount === 0;
  }

  get isAnyFilterApplied() {
    return (
      this.selectedDependencyType !== null ||
      this.selectedComponentType > -1 ||
      (this.args.queryParams.component_query || '').length > 0 ||
      this.args.queryParams.is_dependency ||
      this.args.queryParams.component_type
    );
  }

  get isEmptyAndFilterApplied() {
    return this.hasNoSbomComponent && this.isAnyFilterApplied;
  }

  get isEmptyAndNoFilterApplied() {
    return this.hasNoSbomComponent && !this.isAnyFilterApplied;
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
        headerComponent: 'sbom/scan-details/component-list/type-header',
      },
      {
        name: this.intl.t('dependencyType'),
        component: 'sbom/scan-details/component-list/dependency-type',
        headerComponent:
          'sbom/scan-details/component-list/dependency-type-header',
      },
      {
        name: this.intl.t('status'),
        component: 'sbom/component-status',
      },
    ];
  }

  @action
  handleComponentClick({ rowValue }: { rowValue: SbomComponentModel }) {
    this.router.transitionTo(
      'authenticated.dashboard.sbom.component-details.overview',
      this.args.sbomProject.id,
      this.args.sbomFile.id,
      rowValue.id,
      0
    );
  }

  @action
  onDependencyTypeChange(type: boolean | null) {
    this.selectedDependencyType = type;

    const query = this.args.queryParams.component_query || '';

    const componentType =
      this.selectedComponentType >= 0
        ? COMPONENT_TYPE_NAMES[this.selectedComponentType]
        : null;

    this.fetchSbomComponents.perform(
      this.limit,
      0,
      query,
      true,
      type,
      componentType
    );
  }

  @action
  onComponentTypeChange(type: number) {
    this.selectedComponentType = type;

    const query = this.args.queryParams.component_query || '';

    const componentType = type >= 0 ? COMPONENT_TYPE_NAMES[type] : null;

    this.fetchSbomComponents.perform(
      this.limit,
      0,
      query,
      true,
      this.selectedDependencyType,
      componentType
    );
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    const { component_query } = this.args.queryParams;

    const componentType =
      this.selectedComponentType >= 0
        ? COMPONENT_TYPE_NAMES[this.selectedComponentType]
        : null;

    this.fetchSbomComponents.perform(
      limit,
      offset,
      component_query,
      true,
      this.selectedDependencyType,
      componentType
    );
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    const { component_query } = this.args.queryParams;

    const componentType =
      this.selectedComponentType >= 0
        ? COMPONENT_TYPE_NAMES[this.selectedComponentType]
        : null;

    this.fetchSbomComponents.perform(
      limit,
      0,
      component_query,
      true,
      this.selectedDependencyType,
      componentType
    );
  }

  setRouteQueryParams(
    limit: string | number,
    offset: string | number,
    query: string,
    isDependency: boolean | null,
    componentType: string | null
  ) {
    this.router.transitionTo({
      queryParams: {
        component_limit: limit,
        component_offset: offset,
        component_query: query,
        is_dependency: isDependency !== null ? String(isDependency) : undefined,
        component_type: componentType ?? undefined,
      },
    });
  }

  fetchSbomComponents = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      query: string,
      setQueryParams = true,
      isDependency: boolean | null = null,
      componentType: string | null = null
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(
          limit,
          offset,
          query,
          isDependency,
          componentType
        );
      }

      const queryParams: Record<string, unknown> = {
        limit,
        offset,
        q: query,
        sbomFileId: this.args.sbomFile.id,
      };

      if (isDependency !== null) {
        queryParams['is_dependency'] = isDependency;
      }

      if (componentType) {
        queryParams['component_type'] = componentType;
      }

      try {
        this.componentQueryResponse = (await this.store.query(
          'sbom-component',
          queryParams
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
