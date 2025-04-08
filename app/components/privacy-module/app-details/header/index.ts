import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type PrivacyProjectModel from 'irene/models/privacy-project';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface PrivacyModuleAppDetailsHeaderSignature {
  Args: {
    app: PrivacyProjectModel;
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
  }

  get app() {
    return this.args.app;
  }

  get loading() {
    return this.app.latestFile.isPending || this.app.project.isPending;
  }

  get completedStatus() {
    return (
      this.app.latestFilePrivacyAnalysisStatus === ENUMS.PM_STATUS.COMPLETED
    );
  }

  get failedStatus() {
    return this.app.latestFilePrivacyAnalysisStatus === ENUMS.PM_STATUS.FAILED;
  }

  get inProgressStatus() {
    return (
      this.app.latestFilePrivacyAnalysisStatus === ENUMS.PM_STATUS.IN_PROGRESS
    );
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
    return this.app.latestFile.get('id');
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

    this.privacyModule.resetCountValues();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Header': typeof PrivacyModuleAppDetailsHeaderComponent;
  }
}
