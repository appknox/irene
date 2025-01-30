import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import type FileModel from 'irene/models/file';
import PrivacyModuleService from 'irene/services/privacy-module';
import { tracked } from 'tracked-built-ins';

export interface PrivacyModuleAppDetailsHeaderSignature {
  Args: {
    app: FileModel;
  };
}

export default class PrivacyModuleAppDetailsHeaderComponent extends Component<PrivacyModuleAppDetailsHeaderSignature> {
  @service declare privacyModule: PrivacyModuleService;

  @tracked anchorRef: HTMLElement | null = null;

  get tabItems() {
    return [
      {
        id: 'trackers',
        label: 'Trackers',
        hasBadge: false,
        route: 'authenticated.dashboard.privacy-module.app-details.index',
        activeRoutes:
          'authenticated.dashboard.privacy-module.app-details.index',
      },
      {
        id: 'dangerous-permissions',
        label: 'Dangerous Permissions',
        badgeCount: 20,
        hasBadge: true,
        route:
          'authenticated.dashboard.privacy-module.app-details.danger-perms',
        activeRoutes:
          'authenticated.dashboard.privacy-module.app-details.danger-perms',
      },
      {
        id: 'pii',
        label: 'PII',
        hasBadge: false,
        route: 'authenticated.dashboard.privacy-module.app-details.pii',
        activeRoutes: 'authenticated.dashboard.privacy-module.app-details.pii',
      },
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
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Header': typeof PrivacyModuleAppDetailsHeaderComponent;
  }
}
