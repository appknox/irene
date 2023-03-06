import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import AmAppModel from 'irene/models/am-app';

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
        route: 'authenticated.app-monitoring.monitoring-details.index',
        label: this.intl.t('appMonitoringModule.monitoringDetails'),
      },
      {
        id: 'monitoring-history',
        route: 'authenticated.app-monitoring.monitoring-details.history',
        label: this.intl.t('appMonitoringModule.monitoringHistory'),
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Details': typeof AppMonitoringDetailsComponent;
  }
}
