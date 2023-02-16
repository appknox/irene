import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import AmAppModel from 'irene/models/am-app';
import AMConfigurationModel from 'irene/models/amconfiguration';

interface AppMonitoringTableStatusSignature {
  Args: {
    amApp: AmAppModel;
    settings: AMConfigurationModel | undefined;
  };
}

export default class AppMonitoringTableStatusComponent extends Component<AppMonitoringTableStatusSignature> {
  @service declare intl: IntlService;

  get amApp() {
    return this.args.amApp;
  }

  get amConfiguration() {
    return this.args.settings;
  }

  get monitoredStatusText() {
    if (!this.amApp.isActive) {
      return this.intl.t('inactiveCaptital');
    }

    if (this.amApp.isActive) {
      return this.intl.t('activeCaptital');
    }

    return this.intl.t('inactiveCaptital');
  }

  get monitoredStatusCondition(): 'error' | 'success' {
    if (!this.amApp.isActive) {
      return 'error';
    }

    if (this.amApp.isActive) {
      return 'success';
    }

    return 'error';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'app-monitoring/table/status': typeof AppMonitoringTableStatusComponent;
  }
}
