import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import type { PrivacyModuleAppListQueryParam } from 'irene/routes/authenticated/dashboard/privacy-module/index';
import type FileModel from 'irene/models/file';
import type PrivacyProjectModel from 'irene/models/privacy-project';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface PrivacyModuleAppListTableSignature {
  Args: {
    queryParams: PrivacyModuleAppListQueryParam;
  };
}

export default class PrivacyModuleAppListTableComponent extends Component<PrivacyModuleAppListTableSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;
  @service declare privacyModule: PrivacyModuleService;

  @tracked selectedFile: FileModel | null = null;

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppListTableSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    const { app_limit, app_offset, app_query, app_platform } = args.queryParams;

    this.privacyModule.fetchPrivacyProjects.perform(
      app_limit,
      app_offset,
      app_query,
      app_platform,
      false
    );
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get query() {
    return this.args.queryParams.app_query;
  }

  get platform() {
    return this.args.queryParams.app_platform;
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
    this.privacyModule.fetchPrivacyProjects.perform(
      limit,
      offset,
      this.query,
      this.platform
    );
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.privacyModule.fetchPrivacyProjects.perform(
      limit,
      0,
      this.query,
      this.platform
    );
  }

  get normalizedPlatform(): number {
    return Number(this.args.queryParams.app_platform ?? -1);
  }

  get normalizedQuery(): string {
    return this.args.queryParams.app_query ?? '';
  }

  get isFilterApplied() {
    return this.normalizedQuery !== '' || this.normalizedPlatform !== -1;
  }

  get noResultFound() {
    return (
      this.totalPrivacyProjectCount === 0 &&
      !this.privacyModule.fetchPrivacyProjects.isRunning &&
      this.isFilterApplied
    );
  }

  get isPrivacyListEmpty() {
    return (
      this.totalPrivacyProjectCount === 0 &&
      !this.privacyModule.fetchPrivacyProjects.isRunning &&
      !this.isFilterApplied
    );
  }

  get isFetchPrivacyRunning() {
    return this.privacyModule.fetchPrivacyProjects.isRunning;
  }

  get totalPrivacyProjectCount() {
    return this.privacyModule.privacyProjectQueryResponse?.meta?.count || 0;
  }

  get privacyProjectList() {
    return this.privacyModule.privacyProjectQueryResponse?.slice() || [];
  }

  get resultDependencies() {
    return [this.limit, this.offset];
  }

  @action handleResultDependenciesChange() {
    this.privacyModule.fetchPrivacyProjects.perform(
      this.limit,
      this.offset,
      this.query,
      this.platform,
      false
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table': typeof PrivacyModuleAppListTableComponent;
  }
}
