import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import dayjs from 'dayjs';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

import AmAppModel from 'irene/models/am-app';
import parseError from 'irene/utils/parse-error';
import AmConfigurationModel from 'irene/models/amconfiguration';

interface AppMonitoringDetailsSignature {
  Args: {
    amOrgSettings?: AmConfigurationModel;
    amApp: AmAppModel | null;
  };
}

export default class AppMonitoringDetailsComponent extends Component<AppMonitoringDetailsSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  get tabItems() {
    return [
      {
        id: 'monitoring-details',
        route:
          'authenticated.dashboard.app-monitoring.monitoring-details.index',
        label: this.intl.t('appMonitoringModule.monitoringDetails'),
      },
      {
        id: 'monitoring-history',
        route:
          'authenticated.dashboard.app-monitoring.monitoring-details.history',
        label: this.intl.t('appMonitoringModule.monitoringHistory'),
      },
    ];
  }

  get amApp() {
    return this.args.amApp;
  }

  get amOrgSettings() {
    return this.args.amOrgSettings;
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
      return dayjs(date).format('DD MMM YYYY');
    }

    return date;
  }

  get disableAppMonitoringToggle() {
    return this.toggleAmAppMonitoring.isRunning || !this.amOrgSettings?.enabled;
  }

  @action onMonitoringActionToggle(_: Event, checked?: boolean) {
    this.toggleAmAppMonitoring.perform(!!checked);
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Details': typeof AppMonitoringDetailsComponent;
  }
}
