import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENUMS from 'irene/enums';
import type PrivacyProjectModel from 'irene/models/privacy-project';
import type PrivacyModuleService from 'irene/services/privacy-module';
import type OrganizationService from 'irene/services/organization';

export interface PrivacyModuleAppDetailsHeaderSignature {
  Args: {
    app: PrivacyProjectModel;
  };
}

type TabItem = {
  id: string;
  label: string;
  badgeCount: number;
  hasBadge: boolean;
  route: string;
  activeRoutes: string;
  hasUpdate?: boolean;
  isBeta?: boolean;
};

export default class PrivacyModuleAppDetailsHeaderComponent extends Component<PrivacyModuleAppDetailsHeaderSignature> {
  @service declare privacyModule: PrivacyModuleService;
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked piiEnabled: boolean = false;

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

    if (this.showPii) {
      this.privacyModule.fetchPiiData.perform(10, 0, this.fileId, false);
    }
  }

  @action
  getChipClass(route: string) {
    return this.router.currentRouteName === route
      ? 'beta-chip-active'
      : 'beta-chip-inactive';
  }

  get aiFeatures() {
    return this.organization.selected?.aiFeatures;
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

  get showPii() {
    return this.aiFeatures?.pii;
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

  get tabItems(): TabItem[] {
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
      this.showPii && {
        id: 'pii',
        label: this.intl.t('privacyModule.pii'),
        badgeCount: this.privacyModule.piiDataCount,
        hasBadge: this.privacyModule.piiDataAvailable,
        route: 'authenticated.dashboard.privacy-module.app-details.pii',
        activeRoutes: 'authenticated.dashboard.privacy-module.app-details.pii',
        hasUpdate: this.showPiiUpdated,
        isBeta: true,
      },
    ].filter(Boolean) as TabItem[];
  }

  get showCompleteApiScanNote() {
    return this.privacyModule.showCompleteApiScanNote;
  }

  get showPiiUpdated() {
    return this.privacyModule.showPiiUpdated;
  }

  get showPiiUpdatedNote() {
    return this.privacyModule.showPiiUpdatedNote;
  }

  get noteAvailable() {
    return (
      this.showCompleteApiScanNote ||
      (this.showPiiUpdated && this.showPiiUpdatedNote)
    );
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
