import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import { AkChipColor } from 'irene/components/ak-chip';
import AmAppModel from 'irene/models/am-app';
import AMConfigurationModel from 'irene/models/amconfiguration';

interface AppMonitoringTableStatusSignature {
  Args: {
    amApp: AmAppModel;
    settings: AMConfigurationModel | undefined;
  };
}

export default class AppMonitoringTableStoreVersionComponent extends Component<AppMonitoringTableStatusSignature> {
  @service declare intl: IntlService;

  get amApp() {
    return this.args.amApp;
  }

  get amConfiguration() {
    return this.args.settings;
  }

  get statusText() {
    if (this.amApp.isPending) {
      return this.intl.t('pending');
    }
    if (this.amApp.isNotFound) {
      return this.intl.t('notFound');
    }
    return '';
  }

  get statusCondition(): AkChipColor {
    if (this.amApp.isPending) {
      return 'warn';
    }

    if (this.amApp.isNotFound) {
      return 'error';
    }

    return 'default';
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

  get monitoredStatusCondition() {
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
    'app-monitoring/table/store-version': typeof AppMonitoringTableStoreVersionComponent;
  }
}
