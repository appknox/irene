import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, waitForProperty } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import type Store from 'ember-data/store';

import { waitForPromise } from '@ember/test-waiters';

import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type SbomComponentInventoryModel from 'irene/models/sbom-component-inventory';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomComponentExportModel from 'irene/models/sbom-component-export';
import type SbomComponentInventoryAdapter from 'irene/adapters/sbom-component-inventory';
import type { SbomComponentExportResponse } from 'irene/adapters/sbom-component-inventory';
import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';

const PENDING_STATUSES = [
  ENUMS.SBOM_COMPONENT_EXPORT_STATUS.PENDING,
  ENUMS.SBOM_COMPONENT_EXPORT_STATUS.IN_PROGRESS,
];

type SbomProjectQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomProjectModel> & {
    meta: { count: number };
  };

export interface SbomComponentInventoryDetailsDrawerSignature {
  Args: {
    component: SbomComponentInventoryModel | null;
    open?: boolean;
    onClose: () => void;
  };
}

export default class SbomComponentInventoryDetailsDrawerComponent extends Component<SbomComponentInventoryDetailsDrawerSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;

  @tracked sbomProjectResponse: SbomProjectQueryResponse | null = null;
  @tracked limit = 10;
  @tracked offset = 0;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: SbomComponentInventoryDetailsDrawerSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  }

  get sbomProjectList() {
    return this.sbomProjectResponse?.slice() || [];
  }

  get totalSbomProjectCount() {
    return this.sbomProjectResponse?.meta?.count || 0;
  }

  get hasNoSbomProject() {
    return this.totalSbomProjectCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('appName'),
        component: 'sbom/component-inventory/details-drawer/app-name',
      },
      {
        name: this.intl.t('namespace'),
        component: 'sbom/component-inventory/details-drawer/namespace',
      },
      {
        name: this.intl.t('sbomModule.lastSbomAnalysisOn'),
        component: 'sbom/component-inventory/details-drawer/last-analysed-on',
        textAlign: 'center',
      },
    ];
  }

  /* Reload the apps list whenever a different component is selected. */
  @action
  loadApps() {
    if (this.args.component) {
      this.fetchSbomProjects.perform(this.limit, 0);
    }
  }

  @action
  handleAppRowClick({ rowValue }: { rowValue: SbomProjectModel }) {
    this.navigateToApp.perform(rowValue);
  }

  /**
   * Resolve the app-specific SBFileComponent id for the selected component
   * (matching by bom-ref + version) and deep-link to its detail page. The
   * lookup only runs on click, so it costs one request per navigation.
   */
  findMatchingSbFileComponent(components: SbomComponentModel[]) {
    const component = this.args.component;
    const version = (component?.version || '').trim();
    const byBomRef = components.filter((c) => c.bomRef === component?.bomRef);
    const exact = byBomRef.find((c) => c.cleanVersion === version);

    return exact ?? byBomRef[0] ?? null;
  }

  navigateToApp = task(
    { drop: true },
    async (sbomProject: SbomProjectModel) => {
      const component = this.args.component;
      const sbomFile = await sbomProject.latestSbFile;

      if (!component || !sbomFile) {
        return;
      }

      try {
        const response = await this.store.query('sbom-component', {
          sbomFileId: sbomFile.id,
          q: component.name,
          limit: 100,
        });

        const match = this.findMatchingSbFileComponent(
          response.slice() as SbomComponentModel[]
        );

        if (match) {
          this.router.transitionTo(
            'authenticated.dashboard.sbom.component-details.overview',
            sbomProject.id,
            sbomFile.id,
            match.id,
            0
          );
        } else {
          this.notify.error(
            this.intl.t('sbomModule.componentInventory.componentNotFoundInApp')
          );
        }
      } catch (e) {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  );

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.fetchSbomProjects.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.fetchSbomProjects.perform(limit, 0);
  }

  @action
  handleDownload() {
    this.downloadExport.perform();
  }

  downloadExport = task({ drop: true }, async () => {
    const component = this.args.component;

    if (!component) {
      return;
    }

    const adapter = this.store.adapterFor(
      'sbom-component-inventory'
    ) as SbomComponentInventoryAdapter;

    try {
      const created = await waitForPromise(adapter.createExport(component.id));
      const record = this.pushExport(created);

      if (this.isExportPending(record)) {
        await waitForProperty(
          record,
          'status',
          (status) => !PENDING_STATUSES.includes(status)
        );
      }

      if (
        record.status === ENUMS.SBOM_COMPONENT_EXPORT_STATUS.COMPLETED &&
        record.downloadUrl
      ) {
        this.window.open(record.downloadUrl, '_blank');
      } else {
        this.notify.error(
          this.intl.t('sbomModule.componentInventory.exportFailed')
        );
      }
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  pushExport(payload: SbomComponentExportResponse): SbomComponentExportModel {
    return this.store.push(
      this.store.normalize('sbom-component-export', payload)
    ) as SbomComponentExportModel;
  }

  isExportPending(record: SbomComponentExportModel) {
    return PENDING_STATUSES.includes(record.status);
  }

  fetchSbomProjects = task(
    { drop: true },
    async (limit: string | number, offset: string | number) => {
      const component = this.args.component;

      if (!component) {
        return;
      }

      this.limit = Number(limit);
      this.offset = Number(offset);

      try {
        this.sbomProjectResponse = (await this.store.query('sbom-project', {
          sbomComponentId: component.id,
          limit,
          offset,
        })) as SbomProjectQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInventory::DetailsDrawer': typeof SbomComponentInventoryDetailsDrawerComponent;
  }
}
