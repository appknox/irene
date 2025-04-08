import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type Store from '@ember-data/store';

import type { PrivacyModuleDangerPermissionsQueryParam } from 'irene/routes/authenticated/dashboard/privacy-module/app-details/danger-perms';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type PrivacyModuleService from 'irene/services/privacy-module';
import type FileModel from 'irene/models/file';

export interface PrivacyModuleAppDetailsDangerousPermissionSignature {
  Args: {
    queryParams: PrivacyModuleDangerPermissionsQueryParam;
    file: FileModel;
  };
}

export default class PrivacyModuleAppDetailsDangerousPermissionComponent extends Component<PrivacyModuleAppDetailsDangerousPermissionSignature> {
  @service declare privacyModule: PrivacyModuleService;
  @service declare store: Store;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppDetailsDangerousPermissionSignature['Args']
  ) {
    super(owner, args);

    this.privacyModule.fetchDangerousPermission.perform(
      this.limit,
      this.offset,
      this.fileId,
      false
    );
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get resultDependencies() {
    return [this.limit, this.offset];
  }

  @action handleResultDependenciesChange() {
    this.privacyModule.fetchDangerousPermission.perform(
      this.limit,
      this.offset,
      this.fileId,
      false
    );
  }

  get fileId() {
    return this.args.file.id;
  }

  get dangerousPermissionList() {
    return this.privacyModule.dangerousPermissionList;
  }

  get dangerousPermissionCount() {
    return this.privacyModule.dangerousPermissionCount;
  }

  get isFetchingDangerPerms() {
    return this.privacyModule.fetchDangerousPermission.isRunning;
  }

  get hasNoDangerPerms() {
    return this.dangerousPermissionCount === 0;
  }

  get showEmptyContent() {
    return !this.isFetchingDangerPerms && this.hasNoDangerPerms;
  }

  @action handlePrevNextAction(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.privacyModule.fetchDangerousPermission.perform(
      limit,
      offset,
      this.fileId
    );
  }

  @action handleItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;
    const offset = 0;

    this.privacyModule.fetchDangerousPermission.perform(
      limit,
      offset,
      this.fileId
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::DangerousPermissions': typeof PrivacyModuleAppDetailsDangerousPermissionComponent;
  }
}
