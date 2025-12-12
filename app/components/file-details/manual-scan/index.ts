import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isEmpty } from '@ember/utils';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type FileModel from 'irene/models/file';
import type ManualscanModel from 'irene/models/manualscan';
import type OrganizationService from 'irene/services/organization';
import type IreneAjaxService from 'irene/services/ajax';
import type AnalyticsService from 'irene/services/analytics';
import type { AjaxError } from 'irene/services/ajax';
import type FileRiskModel from 'irene/models/file-risk';

export interface FileDetailsManualScanSignature {
  Args: {
    file: FileModel;
  };
  Blocks: {
    default: [];
  };
}

export default class FileDetailsManualScanComponent extends Component<FileDetailsManualScanSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked manualscan: ManualscanModel | null = null;
  @tracked fileRisk: FileRiskModel | null = null;

  constructor(owner: unknown, args: FileDetailsManualScanSignature['Args']) {
    super(owner, args);

    this.fetchManualScan.perform();
    this.fetchFileRisk.perform();
  }

  get tabItems() {
    return [
      {
        id: 'manual-scan',
        label: this.intl.t('manualScan'),
        route: 'authenticated.dashboard.file.manual-scan.index',
        currentWhen: 'authenticated.dashboard.file.manual-scan.index',
      },
      {
        id: 'manual-results',
        hidden: !this.args.file.isManualDone,
        label: this.intl.t('manualScanResults'),
        hasBadge: true,
        badgeCount: this.fileRisk?.get('riskCountByScanType')?.manual,
        route: 'authenticated.dashboard.file.manual-scan.results',
        currentWhen: 'authenticated.dashboard.file.manual-scan.results',
      },
    ];
  }

  get showManualScanRequestForm() {
    if (this.organization.selected?.isTrial) {
      return false;
    }

    return !this.args.file.isManualRequested;
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

    if (loginRequired && isEmpty(userRoles)) {
      return this.notify.error(tPleaseEnterUserRoles);
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
      });

      this.analytics.track({
        name: 'MANUAL_SCAN_REQUESTED_EVENT',
        properties: {
          feature: 'manual_scan_requested',
          fileId: this.args.file.id,
          projectId: this.args.file.project?.get('id'),
        },
      });

      this.notify.info(tManualRequested);

      if (!this.isDestroyed) {
        await this.args.file.reload();
      }
    } catch (error) {
      const e = error as AjaxError;
      this.notify.error(e.payload.error);
    }
  });

  fetchFileRisk = task(async () => {
    this.fileRisk = await this.args.file.fetchFileRisk();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ManualScan': typeof FileDetailsManualScanComponent;
  }
}
