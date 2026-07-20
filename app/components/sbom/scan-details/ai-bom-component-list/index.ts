import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';
import type IntlService from 'ember-intl/services/intl';

import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

import type SbomComponentAdapter from 'irene/adapters/sbom-component';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type { SbomScanDetailsSummaryBarItem } from 'irene/components/sbom/scan-details/summary-bar';

import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomFileModel from 'irene/models/sbom-file';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import type SbomScanDetailsService from 'irene/services/sbom-scan-details';

export interface AiBomComponentListSignature {
  Element: HTMLDivElement;
  Args: {
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
  };
}

interface AiSummaryResponse {
  total: number;
  by_type: Record<string, number>;
}

export default class AiBomComponentListComponent extends Component<AiBomComponentListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;

  @service('sbom-scan-details')
  declare sbomScanDetailsService: SbomScanDetailsService;

  @tracked selectedComponent: SbomComponentModel | null = null;
  @tracked openComponentDrawer = false;
  @tracked aiSummaryData: AiSummaryResponse | null = null;

  constructor(owner: unknown, args: AiBomComponentListSignature['Args']) {
    super(owner, args);

    this.fetchAiSummary.perform();
  }

  // Deliberately its own fetch, independent of the main component-list
  // reload cycle -- this summary bar always reflects the file's full AI
  // BoM inventory, not what's visible under the current search/filter
  // (see the matching note on the backend's ai_summary action).
  fetchAiSummary = task(async () => {
    const adapter = this.store.adapterFor(
      'sbom-component'
    ) as SbomComponentAdapter;

    const baseUrl = adapter._buildNestedURL(
      'sbom-component',
      this.args.sbomFile.id
    );

    try {
      this.aiSummaryData = (await adapter.ajax(
        `${baseUrl}/ai_summary`,
        'GET'
      )) as AiSummaryResponse;
    } catch (error) {
      this.aiSummaryData = null;
    }
  });

  get summaryItems(): SbomScanDetailsSummaryBarItem[] {
    const byType = this.aiSummaryData?.by_type ?? {};
    const supportingArtifactCount =
      (byType['tokenizer'] ?? 0) +
      (byType['config'] ?? 0) +
      (byType['supporting'] ?? 0);

    // Total always shows, even at 0 -- it's the anchor metric. The per-type
    // breakdown only shows categories that actually have components: with
    // 6 possible types, showing every "X - 0" would make the bar too long
    // and mostly noise for apps that only use one or two AI patterns.
    const totalItem: SbomScanDetailsSummaryBarItem = {
      iconName: 'ph:diamonds-four',
      label: this.intl.t('sbomModule.aiBomComponentsTotal'),
      value: this.aiSummaryData?.total ?? 0,
      isPrimary: true,
    };

    const typeItems: SbomScanDetailsSummaryBarItem[] = [
      {
        iconName: 'hugeicons:ai-brain-04' as const,
        label: this.intl.t('sbomModule.aiTypeLabel.model'),
        value: byType['model'] ?? 0,
      },
      {
        iconName: 'cloud-upload' as const,
        label: this.intl.t('sbomModule.aiTypeLabel.cloudEndpoint'),
        value: byType['cloud_endpoint'] ?? 0,
      },
      {
        iconName: 'key' as const,
        label: this.intl.t('sbomModule.aiTypeLabel.secret'),
        value: byType['secret'] ?? 0,
      },
      {
        iconName: 'solar:library-linear' as const,
        label: this.intl.t('sbomModule.aiTypeLabel.library'),
        value: byType['library'] ?? 0,
      },
      {
        iconName: 'hugeicons:api' as const,
        label: this.intl.t('sbomModule.aiTypeLabel.platformManagedAi'),
        value: byType['platform_managed_ai'] ?? 0,
      },
      {
        iconName: 'mdi:insert-drive-file' as const,
        label: this.intl.t('sbomModule.supportingArtifact'),
        value: supportingArtifactCount,
      },
    ].filter((item) => Number(item.value) > 0);

    const items = [totalItem, ...typeItems];

    return items.map((item, index) => ({
      ...item,
      hideDivider: index === items.length - 1,
    }));
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

  get sbomComponentList() {
    return this.sbomScanDetailsService.sbomComponentList;
  }

  get totalAiBomComponentCount() {
    return this.sbomScanDetailsService.sbomComponentsCount;
  }

  get hasNoAiBomComponent() {
    return this.sbomScanDetailsService.sbomComponentsCount === 0;
  }

  get searchQuery() {
    return this.sbomScanDetailsService.searchQuery;
  }

  get selectedAiArtifactClass() {
    return this.sbomScanDetailsService.selectedAiArtifactClass;
  }

  get isAnyFilterApplied() {
    return (
      this.searchQuery?.trim() !== '' || this.selectedAiArtifactClass !== null
    );
  }

  get isEmptyAndFilterApplied() {
    return this.hasNoAiBomComponent && this.isAnyFilterApplied;
  }

  get isEmptyAndNoFilterApplied() {
    return this.hasNoAiBomComponent && !this.isAnyFilterApplied;
  }

  get columns() {
    return [
      { name: this.intl.t('sbomModule.componentName'), valuePath: 'name' },
      {
        name: this.intl.t('sbomModule.componentType'),
        valuePath: 'aiTypeLabel',
        headerComponent: 'sbom/scan-details/component-list/ai-type-header',
      },
      { name: this.intl.t('sbomModule.purpose'), valuePath: 'aiPurpose' },
    ];
  }

  @action
  handleComponentClick({ rowValue }: { rowValue: SbomComponentModel }) {
    this.selectedComponent = rowValue;
    this.openComponentDrawer = true;
  }

  @action
  handleDrawerClose() {
    this.openComponentDrawer = false;
    this.selectedComponent = null;
  }

  @action
  handleSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    debounceTask(this, 'setSearchQuery', query, 500);
  }

  @action
  setSearchQuery(query: string) {
    this.router.transitionTo({
      queryParams: {
        component_query: query,
        component_offset: 0,
      },
    });

    this.sbomScanDetailsService
      .setQueryData({ component_query: query })
      .setLimitOffset({ offset: 0 })
      .reload();
  }

  @action
  onAiArtifactClassChange(artifactClass: string | null) {
    this.router.transitionTo({
      queryParams: {
        ai_artifact_class: artifactClass,
        component_offset: 0,
      },
    });

    this.sbomScanDetailsService
      .setQueryData({ ai_artifact_class: artifactClass })
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
    'Sbom::ScanDetails::AiBomComponentList': typeof AiBomComponentListComponent;
  }
}
