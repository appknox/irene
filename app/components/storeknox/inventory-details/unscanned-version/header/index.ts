import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import dayjs from 'dayjs';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

import AmAppModel from 'irene/models/am-app';
import parseError from 'irene/utils/parse-error';
import AmConfigurationModel from 'irene/models/amconfiguration';
import OrganizationService from 'irene/services/organization';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';
import { tracked } from 'tracked-built-ins';

interface StoreknoxInventoryDetailsUnscannedVersionHeaderSignature {
  Args: {
    amOrgSettings?: AmConfigurationModel;
    amApp?: AmAppModel | null;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionHeaderComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionHeaderSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;

  @tracked amOrgSettings?: AmConfigurationModel;
  @tracked amApp: AmAppModel | null = null;
  @tracked showSMDetails = true;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsUnscannedVersionHeaderSignature['Args']
  ) {
    super(owner, args);

    this.getAmAppDetails.perform();
  }

  get tabItems() {
    return [
      {
        id: 'monitoring-details',
        route:
          'authenticated.storeknox.inventory-details.unscanned-version.index',
        label: this.intl.t('appMonitoringModule.monitoringDetails'),
      },
      {
        id: 'monitoring-history',
        route:
          'authenticated.storeknox.inventory-details.unscanned-version.history',
        label: this.intl.t('appMonitoringModule.monitoringHistory'),
      },
    ];
  }

  get project() {
    return this.amApp?.get('project');
  }

  get lastFile() {
    return this.project?.get('lastFile');
  }

  get lastSyncedDate() {
    const date = this.amApp?.lastSync.get('syncedOn');

    if (date) {
      return dayjs(date).format('DD MMMM, YYYY');
    }

    return date;
  }

  get disableAppMonitoringToggle() {
    return this.toggleAmAppMonitoring.isRunning || !this.amOrgSettings?.enabled;
  }

  get brandAbuseInfoData() {
    return [
      {
        title: 'Threat Detected',
        value: 'Spoofing',
      },
      {
        title: 'Detected on',
        value: dayjs().format('DD, MMM YYYY'),
      },
      {
        title: 'No of Downloads',
        value: '1500 Download',
      },
      {
        title: 'Publisher',
        value: 'XYZ Teams',
      },
    ];
  }

  @action onMonitoringActionToggle(_: Event, checked?: boolean) {
    this.toggleAmAppMonitoring.perform(!!checked);
  }

  @action handleToggleSMDetails() {
    this.showSMDetails = !this.showSMDetails;
  }

  toggleAmAppMonitoring = task(async (checked: boolean) => {
    try {
      this.amApp?.set('monitoringEnabled', checked);
      await this.amApp?.save();

      this.notify.success(
        'Monitoring ' + `${checked ? 'Enabled' : 'Disabled'}`
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  getAmAppDetails = task(async () => {
    try {
      const amApp = await this.store.findRecord('am-app', 3257);

      const orgModel = this.organization.selected;
      const AmSettings = await orgModel?.get_am_configuration();

      this.amApp = amApp;
      this.amOrgSettings = AmSettings;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::UnscannedVersion::Header': typeof StoreknoxInventoryDetailsUnscannedVersionHeaderComponent;
  }
}
