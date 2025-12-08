import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { runTask } from 'ember-lifeline';
import { tracked } from 'tracked-built-ins';
import { waitForPromise } from '@ember/test-waiters';
import dayjs from 'dayjs';

import parseError from 'irene/utils/parse-error';
import type IntlService from 'ember-intl/services/intl';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkOrganizationService from 'irene/services/sk-organization';
import type IreneAjaxService from 'irene/services/ajax';
import type AnalyticsService from 'irene/services/analytics';

export interface StoreknoxInventoryDetailsHeaderToggleMonitoringDrawerSignature {
  Args: {
    open: boolean;
    onClose: () => void;
    confirmMonitoringToggle: () => void;
    cancelMonitoringToggle: () => void;
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsHeaderToggleMonitoringDrawerComponent extends Component<StoreknoxInventoryDetailsHeaderToggleMonitoringDrawerSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare analytics: AnalyticsService;
  @service('browser/window') declare window: Window;
  @service('sk-organization') declare skOrg: SkOrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked hasContactedSupport = false;

  CONTACT_SUPPORT_ENDPOINT = 'v2/feature_request/sk_credit';
  CREDIT_REQUEST_KEY = 'storeknox_credit_request';

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsHeaderToggleMonitoringDrawerSignature['Args']
  ) {
    super(owner, args);

    this.loadOrgSubStatus.perform();
  }

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get availableLicenses() {
    return this.skOrg.selectedSkOrgSub?.licensesRemaining;
  }

  get noLicensesAvailable() {
    return this.availableLicenses === 0;
  }

  get nextArchiveActionDate() {
    return dayjs().add(6, 'month').format('MMM D, YYYY');
  }

  get loadingConfirmButton() {
    return this.loadOrgSubStatus.isRunning || this.contactSupport.isRunning;
  }

  get drawerMessages() {
    if (this.noLicensesAvailable) {
      return {
        message: this.intl.t('storeknox.noLicensesAvailable', {
          htmlSafe: true,
          availableLicenses: this.availableLicenses,
        }),

        confirmButtonText: this.intl.t('contactSupport'),
        cancelButtonText: this.intl.t('close'),
      };
    }

    return {
      message: this.intl.t('storeknox.licenseAllocationNote', {
        htmlSafe: true,
        availableLicenses: this.availableLicenses,
      }),

      confirmButtonText: `${this.intl.t('yes')}, ${this.intl.t('turnOn')}`,
      cancelButtonText: this.intl.t('cancel'),
    };
  }

  @action confirmMonitoringToggle() {
    if (this.noLicensesAvailable) {
      this.contactSupport.perform();
    } else {
      this.args.confirmMonitoringToggle();
      this.args.onClose();
    }
  }

  @action cancelMonitoringToggle(onClose: () => void) {
    onClose();
    runTask(this, this.args.cancelMonitoringToggle, 300);
  }

  contactSupport = task(async () => {
    try {
      await waitForPromise(this.ajax.post(this.CONTACT_SUPPORT_ENDPOINT));

      this.analytics.track({
        name: 'FEATURE_REQUEST_EVENT',
        properties: {
          feature: 'storeknox_credit',
        },
      });

      this.window.localStorage.setItem(this.CREDIT_REQUEST_KEY, 'true');
      this.hasContactedSupport = true;
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });

  loadOrgSubStatus = task(async () => {
    // Check if user has contacted support
    this.hasContactedSupport =
      this.window.localStorage.getItem(this.CREDIT_REQUEST_KEY) === 'true';

    await this.skOrg.reloadOrgSub();

    // If user has contacted support, remove the key from local storage
    if (!this.noLicensesAvailable) {
      this.window.localStorage.removeItem(this.CREDIT_REQUEST_KEY);
      this.hasContactedSupport = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::Header::ToggleMonitoringDrawer': typeof StoreknoxInventoryDetailsHeaderToggleMonitoringDrawerComponent;
  }
}
