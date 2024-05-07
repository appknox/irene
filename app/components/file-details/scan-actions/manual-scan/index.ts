import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { isEmpty } from '@ember/utils';

import triggerAnalytics from 'irene/utils/trigger-analytics';
import ENV from 'irene/config/environment';
import FileModel from 'irene/models/file';
import OrganizationService from 'irene/services/organization';
import ManualscanModel from 'irene/models/manualscan';
import ENUMS from 'irene/enums';

export interface FileDetailsScanActionsManualScanSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsManualScanComponent extends Component<FileDetailsScanActionsManualScanSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare ajax: any;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked showManualScanModal = false;
  @tracked showManualScanRequestAccessModal = false;
  @tracked manualscan: ManualscanModel | null = null;

  constructor(
    owner: unknown,
    args: FileDetailsScanActionsManualScanSignature['Args']
  ) {
    super(owner, args);

    this.fetchManualScan.perform();
  }

  get manualScanFormSections() {
    return [
      {
        id: 'basic-info',
        summaryText: this.intl.t('modalCard.manual.basicAppInfo'),
        contentComponent:
          'file-details/scan-actions/manual-scan/basic-info' as const,
      },
      {
        id: 'login-details',
        summaryText: this.intl.t('modalCard.manual.loginDetails'),
        contentComponent:
          'file-details/scan-actions/manual-scan/login-details' as const,
      },
      {
        id: 'vpn-details',
        summaryText: this.intl.t('modalCard.manual.vpnDetails'),
        contentComponent:
          'file-details/scan-actions/manual-scan/vpn-details' as const,
      },
    ];
  }

  get manualScanStatusLabels() {
    return {
      [ENUMS.MANUAL.NONE]: this.intl.t('notStarted'),
      [ENUMS.MANUAL.REQUESTED]: this.intl.t('requested'),
      [ENUMS.MANUAL.ASSESSING]: this.intl.t('inProgress'),
      [ENUMS.MANUAL.DONE]: this.intl.t('completed'),
    };
  }

  get manualScanStatusText() {
    if (this.args.file.isManualDone) {
      return this.manualScanStatusLabels[ENUMS.MANUAL.DONE];
    } else if (this.args.file.manual == 3 && !this.args.file.isManualDone) {
      return this.manualScanStatusLabels[ENUMS.MANUAL.ASSESSING];
    } else {
      return this.manualScanStatusLabels[this.args.file.manual];
    }
  }

  @action
  handleManualScanRequestAccessModalOpen() {
    this.showManualScanRequestAccessModal = true;
  }

  @action
  handleManualScanModalOpen() {
    triggerAnalytics(
      'feature',
      ENV.csb['manualScanBtnClick'] as CsbAnalyticsFeatureData
    );

    this.showManualScanModal = true;
  }

  @action
  handleManualScanModalClose() {
    this.showManualScanModal = false;
  }

  fetchManualScan = task(async () => {
    this.manualscan = await this.store.findRecord(
      'manualscan',
      this.args.file.id
    );
  });

  saveManualScanForm = task(async () => {
    const appName = this.args.file.name;
    const appEnv = this.manualscan?.filteredAppEnv;
    const appAction = this.manualscan?.filteredAppAction;
    const minOsVersion = this.manualscan?.minOsVersion;

    const contactName = this.manualscan?.contact.name;
    const contactEmail = this.manualscan?.contact.email;

    const contact = {
      name: contactName,
      email: contactEmail,
    };

    const tPleaseEnterUserRoles = this.intl.t(
      'modalCard.manual.pleaseEnterUserRoles'
    );

    const loginRequired = this.manualscan?.loginRequired;
    const userRoles = this.manualscan?.userRoles;

    if (loginRequired) {
      if (isEmpty(userRoles)) {
        return this.notify.error(tPleaseEnterUserRoles);
      }
    }

    if (userRoles) {
      userRoles.forEach((userRole) => {
        delete userRole.id;
      });
    }

    const tPleaseEnterVPNDetails = this.intl.t(
      'modalCard.manual.pleaseEnterVPNDetails'
    );

    const vpnRequired = this.manualscan?.vpnRequired;

    const vpnAddress = this.manualscan?.vpnDetails?.address;
    const vpnPort = this.manualscan?.vpnDetails?.port;

    if (vpnRequired) {
      for (const inputValue of [vpnAddress, vpnPort]) {
        if (isEmpty(inputValue)) {
          return this.notify.error(tPleaseEnterVPNDetails);
        }
      }
    }

    const vpnUsername = this.manualscan?.vpnDetails.username;
    const vpnPassword = this.manualscan?.vpnDetails.password;

    const vpnDetails = {
      address: vpnAddress,
      port: vpnPort,
      username: vpnUsername,
      password: vpnPassword,
    };

    const additionalComments = this.manualscan?.additionalComments;

    const data = {
      app_name: appName,
      app_env: appEnv,
      min_os_version: minOsVersion,
      app_action: appAction,
      login_required: loginRequired,
      user_roles: userRoles,
      vpn_required: vpnRequired,
      vpn_details: vpnDetails,
      contact,
      additional_comments: additionalComments,
    };

    const tManualRequested = this.intl.t('manualRequested');

    const url = [ENV.endpoints['manualscans'], this.args.file.id].join('/');

    try {
      await this.ajax.put(url, {
        data: JSON.stringify(data),
        contentType: 'application/json',
      });

      triggerAnalytics(
        'feature',
        ENV.csb['requestManualScan'] as CsbAnalyticsFeatureData
      );

      this.notify.info(tManualRequested);

      if (!this.isDestroyed) {
        await this.args.file.reload();
        this.handleManualScanModalClose();
      }
    } catch (error) {
      const e = error as AdapterError;
      this.notify.error(e.payload.error);
    }
  });

  requestManualScanAccess = task(async () => {
    try {
      const url = [
        ENV.endpoints['organizations'],
        this.organization.selected?.id,
        ENV.endpoints['requestAccess'],
      ].join('/');

      await this.ajax.post(url);
      await this.args.file.reload();

      this.notify.success(this.intl.t('accessRequested'));

      this.showManualScanRequestAccessModal = false;
    } catch (error) {
      const err = error as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::ManualScan': typeof FileDetailsScanActionsManualScanComponent;
    'file-details/scan-actions/manual-scan': typeof FileDetailsScanActionsManualScanComponent;
  }
}
