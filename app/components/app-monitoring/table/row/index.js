import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class AppMonitoringTableRowComponent extends Component {
  @service intl;

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

  get statusCondition() {
    if (this.amApp.isPending) {
      return 'warning';
    }
    if (this.amApp.isNotFound) {
      return 'alert';
    }
    return '';
  }

  get monitoredStatusText() {
    if (!this.amConfiguration.enabled) {
      return this.intl.t('inactiveCaptital');
    }
    if (this.amApp.isActive) {
      return this.intl.t('activeCaptital');
    }
    return this.intl.t('inactiveCaptital');
  }

  get monitoredStatusCondition() {
    if (!this.amConfiguration.enabled) {
      return 'alert';
    }
    if (this.amApp.isActive) {
      return 'success';
    }
    return 'alert';
  }
}
