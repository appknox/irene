import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SkAppModel from 'irene/models/sk-app';
import type SkOrganizationService from 'irene/services/sk-organization';

export interface StoreknoxInventoryAppListTableMonitoringStatusSignature {
  Element: HTMLElement;
  Args: {
    app?: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxInventoryAppListTableMonitoringStatusComponent extends Component<StoreknoxInventoryAppListTableMonitoringStatusSignature> {
  @service declare intl: IntlService;
  @service declare skOrganization: SkOrganizationService;

  private htmlSafe = { htmlSafe: true };

  get orgHasFakeAppDetectionFeature() {
    return this.skOrganization.selected?.skFeatures.fake_app_detection;
  }

  get app() {
    return this.args.app;
  }

  get disableTooltip() {
    return this.args.loading;
  }

  get showFakeAppsWarning() {
    return this.app?.fakeAppDetectionHasResults;
  }

  get showUnscannedVersionsWarning() {
    return this.app?.storeMonitoringStatusIsActionNeeded;
  }

  get showStoreMonitoringStatusNoActionNeeded() {
    return this.app?.storeMonitoringStatusIsNoActionNeeded;
  }

  get initializingTooltipMessage() {
    const app = this.app;

    const bothInitializing =
      app?.fakeAppDetectionIsInitializing &&
      app?.storeMonitoringStatusIsPending;

    if (bothInitializing) {
      return this.intl.t('storeknox.initializingMsg');
    }

    if (
      app?.fakeAppDetectionIsInitializing &&
      !app?.storeMonitoringStatusIsDisabled
    ) {
      return this.intl.t('storeknox.initializingMsgFakeApp', this.htmlSafe);
    }

    if (
      app?.storeMonitoringStatusIsPending &&
      !app?.fakeAppDetectionIsDisabled
    ) {
      return this.intl.t(
        'storeknox.initializingMsgStoreMonitoring',
        this.htmlSafe
      );
    }

    return this.intl.t('storeknox.initializingMsg');
  }

  get tooltipMessage() {
    const app = this.app;

    if (app?.appMonitoringIsInDisabledState) {
      return this.intl.t('storeknox.disabledMsg');
    }

    if (this.showUnscannedVersionsWarning && this.showFakeAppsWarning) {
      return this.intl.t(
        'storeknox.unscannedVersionsAndFakeAppsDetectedTitle',
        this.htmlSafe
      );
    }

    if (this.showFakeAppsWarning) {
      return this.intl.t('storeknox.fakeAppsDetectedTitle', this.htmlSafe);
    }

    if (this.showUnscannedVersionsWarning) {
      return this.intl.t('storeknox.unscannedVersionsTitle', this.htmlSafe);
    }

    if (app?.appIsInInitializingState) {
      return this.initializingTooltipMessage;
    }

    if (!this.orgHasFakeAppDetectionFeature) {
      return this.intl.t('storeknox.noUnscannedVersions', this.htmlSafe);
    }

    return this.intl.t(
      'storeknox.noUnscannedVersionsOrFakeAppsDetectedMsg',
      this.htmlSafe
    );
  }

  get tooltipSuffix() {
    if (
      this.showStoreMonitoringStatusNoActionNeeded ||
      this.showUnscannedVersionsWarning ||
      this.showFakeAppsWarning
    ) {
      return this.intl.t('storeknox.haveBeenDetected');
    }

    return '';
  }

  get iconDetails() {
    const app = this.app;

    if (app?.appMonitoringIsInDisabledState) {
      return {
        icon: 'ak-svg/sox-monitoring-stats-icons/disabled' as const,
        key: 'disabled',
      };
    }

    if (app?.needsAction) {
      return {
        icon: 'ak-svg/sox-monitoring-stats-icons/action-needed' as const,
        key: 'action-needed',
      };
    }

    if (app?.appIsInInitializingState) {
      return {
        icon: 'ak-svg/sox-monitoring-stats-icons/initializing' as const,
        key: 'initializing',
      };
    }

    return {
      icon: 'ak-svg/sox-monitoring-stats-icons/no-action-needed' as const,
      key: 'no-action-needed',
    };
  }

  get statusText() {
    const app = this.app;

    if (app?.needsAction) {
      return this.intl.t('storeknox.needsAction');
    }

    if (app?.appIsInInitializingState) {
      return this.intl.t('storeknox.beingInitialized');
    }

    if (app?.appMonitoringIsInDisabledState) {
      return this.intl.t('disabled');
    }

    return this.intl.t('storeknox.noActionNeeded');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'storeknox/inventory/app-list/table/monitoring-status': typeof StoreknoxInventoryAppListTableMonitoringStatusComponent;
  }
}
