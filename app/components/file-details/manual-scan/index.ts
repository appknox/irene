import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isEmpty } from '@ember/utils';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import triggerAnalytics from 'irene/utils/trigger-analytics';
import ENV from 'irene/config/environment';
import type FileModel from 'irene/models/file';
import type ManualscanModel from 'irene/models/manualscan';
import type OrganizationService from 'irene/services/organization';

export interface FileDetailsManualScanSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsManualScanComponent extends Component<FileDetailsManualScanSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked manualscan: ManualscanModel | null = null;

  constructor(owner: unknown, args: FileDetailsManualScanSignature['Args']) {
    super(owner, args);

    this.fetchManualScan.perform();
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.dashboard.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.dashboard.file',
        linkTitle: this.intl.t('scanDetails'),
        model: this.args.file.id,
      },
      {
        route: 'authenticated.dashboard.file.manual-scan',
        linkTitle: 'Manual Scan',
        model: this.args.file.id,
      },
    ];
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
    'FileDetails::ManualScan': typeof FileDetailsManualScanComponent;
  }
}
