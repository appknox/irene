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

export interface SbomScanDetailsComponentListSignature {
  Element: HTMLDivElement;
  Args: {
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
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
      this.selectedComponentType > -1
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
