import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';

import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomFileModel from 'irene/models/sbom-file';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import type SbomScanDetailsService from 'irene/services/sbom-scan-details';
import type { SbomScanDetailsView } from 'irene/components/sbom/scan-details';

export interface SbomScanDetailsComponentListSignature {
  Element: HTMLDivElement;
  Args: {
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
    view?: SbomScanDetailsView;
    showReachability?: boolean;
    /** Switches the scan-details page to the Complete analysis tab. */
    onViewComplete?: () => void;
  };
}

export default class SbomScanDetailsComponentListComponent extends Component<SbomScanDetailsComponentListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @service('sbom-scan-details')
  declare sbomScanDetailsService: SbomScanDetailsService;

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get tNoComponentsFound() {
    return this.intl.t('sbomModule.componentListEmptyText.title');
  }

  /**
   * Empty-result heading: echoes the search term when there is one, so the
   * user can see what matched nothing; otherwise the generic filter copy.
   */
  get tEmptyResultTitle() {
    const query = this.searchQuery?.trim();

    return query
      ? this.intl.t('sbomModule.noComponentsMatch', { query })
      : this.tNoComponentsFound;
  }

  get tNoComponentsFoundFilter() {
    return this.intl.t('sbomModule.noComponentsFoundFilter');
  }

  get isFetchingSbomComponentList() {
    return this.sbomScanDetailsService.isFetchingSbomComponentList;
  }

  get limit() {
    return this.sbomScanDetailsService.limit;
  }

  get offset() {
    return this.sbomScanDetailsService.offset;
  }

  get viewType() {
    return this.sbomScanDetailsService.viewType;
  }

  get searchQuery() {
    return this.sbomScanDetailsService.searchQuery;
  }

  get selectedDependencyType() {
    return this.sbomScanDetailsService.selectedDependencyType;
  }

  get selectedComponentType() {
    return this.sbomScanDetailsService.selectedComponentType;
  }

  get selectedReachability() {
    return this.sbomScanDetailsService.selectedReachability;
  }

  get sbomComponentList() {
    return this.sbomScanDetailsService.sbomComponentList;
  }

  get totalSbomComponentCount() {
    return this.sbomScanDetailsService.sbomComponentsCount;
  }

  get hasNoSbomComponent() {
    return this.sbomScanDetailsService.sbomComponentsCount === 0;
  }

  get isAnyFilterApplied() {
    return (
      this.searchQuery?.trim() !== '' ||
      this.selectedDependencyType !== null ||
      this.selectedComponentType > -1 ||
      this.selectedReachability !== null
    );
  }

  get isEmptyAndFilterApplied() {
    return this.hasNoSbomComponent && this.isAnyFilterApplied;
  }

  get isEmptyAndNoFilterApplied() {
    return this.hasNoSbomComponent && !this.isAnyFilterApplied;
  }

  /**
   * Reachability ran, the insights list is empty and nothing narrows it:
   * the scan simply has no reachable finding, which is not a missing SBOM.
   */
  get isInsightsEmpty() {
    return (
      this.isInsightsView &&
      this.args.showReachability !== false &&
      this.isEmptyAndNoFilterApplied
    );
  }

  @action
  viewCompleteAnalysis() {
    this.args.onViewComplete?.();
  }

  get nameColumn() {
    return {
      name: this.intl.t('sbomModule.componentName'),
      valuePath: 'name',
      width: 150,
    };
  }

  get typeColumn() {
    return {
      name: this.intl.t('sbomModule.componentType'),
      component: 'sbom/scan-details/component-list/type',
      headerComponent: 'sbom/scan-details/component-list/type-header',
    };
  }

  get dependencyTypeColumn() {
    return {
      name: this.intl.t('dependencyType'),
      component: 'sbom/scan-details/component-list/dependency-type',
      headerComponent:
        'sbom/scan-details/component-list/dependency-type-header',
    };
  }

  get statusColumn() {
    return {
      name: this.intl.t('status'),
      component: 'sbom/component-status',
    };
  }

  /**
   * Insights tab: the full purl leads, the verdict sits next to the status
   * it qualifies, and the component-type column is dropped — every row here
   * is a vulnerable library, so the type adds nothing.
   */
  get insightsColumns() {
    return [
      {
        name: this.intl.t('sbomModule.componentName'),
        component: 'sbom/scan-details/component-list/purl',
        width: 220,
      },
      this.statusColumn,
      {
        name: this.intl.t('sbomModule.reachabilityInsights.title'),
        // Per-advisory counts rather than one rolled-up chip.
        component: 'sbom/scan-details/component-list/reachability-counts',
        headerComponent: 'sbom/scan-details/component-list/reachability-header',
      },
      this.dependencyTypeColumn,
    ];
  }

  get columns() {
    const columns = [
      this.nameColumn,
      this.typeColumn,
      this.dependencyTypeColumn,
      this.statusColumn,
    ];

    // Without reachability every cell would read "-", so the column is
    // dropped rather than shown empty.
    if (this.args.showReachability === false) {
      return columns;
    }

    if (this.isInsightsView) {
      return this.insightsColumns;
    }

    return [
      ...columns,
      {
        name: this.intl.t('sbomModule.reachability.title'),
        component: 'sbom/scan-details/component-list/reachability',
        headerComponent: 'sbom/scan-details/component-list/reachability-header',
      },
    ];
  }

  /** Defaults to the complete list; only an explicit `insights` filters. */
  get isInsightsView() {
    return this.args.view === 'insights';
  }

  /**
   * Insights rows open the one-page reachability insights screen; Complete
   * analysis rows keep opening the tabbed component details.
   */
  @action
  handleComponentClick({ rowValue }: { rowValue: SbomComponentModel }) {
    const base = [
      this.args.sbomProject.id,
      this.args.sbomFile.id,
      rowValue.id,
      0,
    ] as const;

    if (this.isInsightsView) {
      // A fresh row click opens the first vulnerability, not the last paged-to.
      this.router.transitionTo(
        'authenticated.dashboard.sbom.component-insights',
        ...base,
        { queryParams: { vuln: null } }
      );
    } else {
      this.router.transitionTo(
        'authenticated.dashboard.sbom.component-details.overview',
        ...base
      );
    }
  }

  @action
  onDependencyTypeChange(type: boolean | null) {
    this.router.transitionTo({
      queryParams: {
        is_dependency: type,
        component_offset: 0,
      },
    });

    this.sbomScanDetailsService
      .setQueryData({ dependency_type: type === null ? null : String(type) })
      .setLimitOffset({ offset: 0 })
      .reload();
  }

  @action
  onReachabilityChange(exposure: string | null) {
    this.router.transitionTo({
      queryParams: {
        reachability: exposure,
        component_offset: 0,
      },
    });

    this.sbomScanDetailsService
      .setQueryData({ reachability: exposure })
      .setLimitOffset({ offset: 0 })
      .reload();
  }

  @action
  onComponentTypeChange(type: number) {
    this.router.transitionTo({
      queryParams: {
        component_type: type,
        component_offset: 0,
      },
    });

    this.sbomScanDetailsService
      .setQueryData({ component_type: type })
      .setLimitOffset({ offset: 0 })
      .reload();
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        component_limit: limit,
        component_offset: offset,
      },
    });

    this.sbomScanDetailsService.setLimitOffset({ limit, offset }).reload();
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        component_limit: limit,
        component_offset: 0,
      },
    });

    this.sbomScanDetailsService.setLimitOffset({ limit, offset: 0 }).reload();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList': typeof SbomScanDetailsComponentListComponent;
  }
}
