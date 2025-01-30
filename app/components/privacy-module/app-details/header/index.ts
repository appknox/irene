import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type FileModel from 'irene/models/file';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface PrivacyModuleAppDetailsHeaderSignature {
  Args: {
    app: FileModel;
  };
}

export default class PrivacyModuleAppDetailsHeaderComponent extends Component<PrivacyModuleAppDetailsHeaderSignature> {
  @service declare privacyModule: PrivacyModuleService;

  @tracked anchorRef: HTMLElement | null = null;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppDetailsHeaderSignature['Args']
  ) {
    super(owner, args);

    this.privacyModule.fetchTrackerData.perform(10, 0, this.fileId, false);

    this.privacyModule.fetchDangerousPermission.perform(
      10,
      0,
      this.fileId,
      false
    );
  }

  get fileId() {
    return this.args.app.id;
  }

  get tabItems() {
    return [
      {
        id: 'trackers',
        label: 'Trackers',
        badgeCount: this.privacyModule.trackerDataCount,
        hasBadge: true,
        route: 'authenticated.dashboard.privacy-module.app-details.index',
        activeRoutes:
          'authenticated.dashboard.privacy-module.app-details.index',
      },
      {
        id: 'dangerous-permissions',
        label: 'Dangerous Permissions',
        badgeCount: this.privacyModule.dangerousPermissionCount,
        hasBadge: true,
        route:
          'authenticated.dashboard.privacy-module.app-details.danger-perms',
        activeRoutes:
          'authenticated.dashboard.privacy-module.app-details.danger-perms',
      },
      // {
      //   id: 'pii',
      //   label: 'PII',
      //   badgeCount: 6,
      //   hasBadge: true,
      //   route: 'authenticated.dashboard.privacy-module.app-details.pii',
      //   activeRoutes: 'authenticated.dashboard.privacy-module.app-details.pii',
      // },
    ];
  }

  get menuItems() {
    return [
      {
        label: 'View Scan Details',
        icon: 'open-in-new',
      },
    ];
  }

  get fileSummaryIsExpanded() {
    return this.privacyModule.expandFileDetailsSummaryFileId !== null;
  }

  @action
  handleOpenMenu(event: MouseEvent) {
    event.stopPropagation();
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleCloseMenu() {
    this.anchorRef = null;
  }

  @action downloadReport() {
    window.alert('Report Downloaded!');
  }

  @action onShowMoreFileSummary(status: boolean, fileID: string) {
    this.privacyModule.expandFileDetailsSummaryFileId = status ? fileID : null;
  }

  willDestroy(): void {
    super.willDestroy();

    this.privacyModule.expandFileDetailsSummaryFileId = null;
    this.privacyModule.trackerDataCount = 0;
    this.privacyModule.dangerousPermissionCount = 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Header': typeof PrivacyModuleAppDetailsHeaderComponent;
  }
}
