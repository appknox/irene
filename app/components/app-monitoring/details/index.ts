import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import AmAppModel from 'irene/models/am-app';
import dayjs from 'dayjs';

interface AppMonitoringDetailsSignature {
  Args: {
    amApp: AmAppModel | null;
  };
}

export default class AppMonitoringDetailsComponent extends Component<AppMonitoringDetailsSignature> {
  @service declare intl: IntlService;

  get tabItems() {
    return [
      {
        id: 'monitoring-details',
        route:
          'authenticated.dashboard.app-monitoring.monitoring-details.index',
        label: this.intl.t('appMonitoringModule.monitoringDetails'),
      },
    ];
  }

  get amApp() {
    return this.args.amApp;
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
      const formattedDate = dayjs(date).format('DD MMM YYYY');

      return formattedDate;
    }

    return date;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Details': typeof AppMonitoringDetailsComponent;
  }
}
