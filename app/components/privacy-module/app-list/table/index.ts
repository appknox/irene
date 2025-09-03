import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type { PrivacyModuleAppListQueryParam } from 'irene/routes/authenticated/dashboard/privacy-module/index';
import type FileModel from 'irene/models/file';
import type PrivacyProjectModel from 'irene/models/privacy-project';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';

type PrivacyProjectQueryResponse =
  DS.AdapterPopulatedRecordArray<PrivacyProjectModel> & {
    meta: { count: number };
  };

export interface PrivacyModuleAppListTableSignature {
  Args: {
    queryParams: PrivacyModuleAppListQueryParam;
  };
}

export default class PrivacyModuleAppListTableComponent extends Component<PrivacyModuleAppListTableSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked privacyProjectQueryResponse: PrivacyProjectQueryResponse | null =
    null;
  @tracked selectedFile: FileModel | null = null;
  @tracked showNoScanAlert = false;

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppListTableSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    const { app_limit, app_offset } = args.queryParams;

    this.fetchPrivacyProjects.perform(app_limit, app_offset, false);
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get columns() {
    return [
      {
        name: this.intl.t('platform'),
        component: 'privacy-module/app-list/table/platform' as const,
        textAlign: 'center',
        width: 70,
        isResizable: false,
        isReorderable: false,
      },
      {
        name: this.intl.t('application'),
        component: 'privacy-module/app-list/table/application' as const,
        textAlign: 'left',
        width: 200,
        isResizable: false,
        isReorderable: false,
      },
      {
        name: this.intl.t('privacyModule.lastScannedOn'),
        component: 'privacy-module/app-list/table/last-scanned' as const,
        textAlign: 'left',
        width: 100,
        isResizable: false,
        isReorderable: false,
      },
      {
        name: this.intl.t('status'),
        component: 'privacy-module/app-list/table/status' as const,
        textAlign: 'center',
        width: 200,
        isResizable: false,
        isReorderable: false,
      },
      {
        name: this.intl.t('action'),
        component: 'privacy-module/app-list/table/action' as const,
        textAlign: 'center',
        width: 70,
        isResizable: false,
        isReorderable: false,
      },
    ];
  }

  get openViewReportDrawer() {
    return Boolean(this.selectedFile);
  }

  @action
  async handleViewReportOpen(privacyProject: PrivacyProjectModel) {
    this.selectedFile = await privacyProject.latestFile;
  }

  @action
  handleViewReportClose() {
    this.selectedFile = null;
  }

  @action async onRowItemClick({
    rowValue,
  }: {
    rowValue: PrivacyProjectModel;
  }) {
    this.router.transitionTo(
      'authenticated.dashboard.privacy-module.app-details.index',
      rowValue.id
    );
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.fetchPrivacyProjects.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.fetchPrivacyProjects.perform(limit, 0);
  }

  get isPrivacyListEmpty() {
    return (
      this.totalPrivacyProjectCount === 0 &&
      !this.fetchPrivacyProjects.isRunning
    );
  }

  get totalPrivacyProjectCount() {
    return this.privacyProjectQueryResponse?.meta?.count || 0;
  }

  get privacyProjectList() {
    return this.privacyProjectQueryResponse?.slice() || [];
  }

  get resultDependencies() {
    return [this.limit, this.offset];
  }

  @action handleResultDependenciesChange() {
    this.fetchPrivacyProjects.perform(this.limit, this.offset, false);
  }

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }

  fetchPrivacyProjects = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        this.privacyProjectQueryResponse = (await this.store.query(
          'privacy-project',
          {
            limit,
            offset,
          }
        )) as PrivacyProjectQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table': typeof PrivacyModuleAppListTableComponent;
  }
}
