import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { PrivacyStatus } from 'irene/models/privacy-project';
import type FileModel from 'irene/models/file';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface PrivacyModuleAppDetailsHeaderSignature {
  Args: {
    app: FileModel;
  };
}

export default class PrivacyModuleAppDetailsHeaderComponent extends Component<PrivacyModuleAppDetailsHeaderSignature> {
  @service declare privacyModule: PrivacyModuleService;
  @service declare intl: IntlService;

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

    this.privacyModule.getPrivacyAppStatus(this.fileId);
  }

  get loading() {
    return this.privacyModule.privacyStatus == null;
  }

  get failedStatus() {
    return this.privacyModule.privacyStatus === PrivacyStatus.FAILED;
  }

  get inProgressStatus() {
    return this.privacyModule.privacyStatus === PrivacyStatus.IN_PROGRESS;
  }

  get statusInfo() {
    if (this.failedStatus) {
      return {
        heading: this.intl.t('privacyModule.failedHeading'),
        description: this.intl.t('privacyModule.failedDescription'),
        svgComponent: 'ak-svg/privacy-upload',
      };
    } else if (this.inProgressStatus) {
      return {
        heading: this.intl.t('privacyModule.inProgressHeading'),
        description: this.intl.t('privacyModule.inProgressDescription'),
        svgComponent: 'ak-svg/privacy-in-progress',
      };
    }

    return null;
  }

  get fileId() {
    return this.args.app.id;
  }

  get tabItems() {
    return [
      {
        id: 'trackers',
        label: this.intl.t('privacyModule.trackers'),
        badgeCount: this.privacyModule.trackerDataCount,
        hasBadge: true,
        route: 'authenticated.dashboard.privacy-module.app-details.index',
        activeRoutes:
          'authenticated.dashboard.privacy-module.app-details.index',
      },
      {
        id: 'dangerous-permissions',
        label: this.intl.t('privacyModule.dangerPerms'),
        badgeCount: this.privacyModule.dangerousPermissionCount,
        hasBadge: true,
        route:
          'authenticated.dashboard.privacy-module.app-details.danger-perms',
        activeRoutes:
          'authenticated.dashboard.privacy-module.app-details.danger-perms',
      },
      // {
      //   id: 'pii',
      //   label: this.intl.t('privacyModule.pii'),
      //   badgeCount: 6,
      //   hasBadge: true,
      //   route: 'authenticated.dashboard.privacy-module.app-details.pii',
      //   activeRoutes: 'authenticated.dashboard.privacy-module.app-details.pii',
      // },
    ];
  }

  willDestroy(): void {
    super.willDestroy();

    this.privacyModule.trackerDataCount = 0;
    this.privacyModule.dangerousPermissionCount = 0;
    this.privacyModule.trackerRequest = null;
    this.privacyModule.permissionRequest = null;
    this.privacyModule.privacyStatus = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Header': typeof PrivacyModuleAppDetailsHeaderComponent;
  }
}
