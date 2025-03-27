import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

export default class AdminUserManagementUsersTableProductAccessHeaderComponent extends Component {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked vapChecked: boolean = true;
  @tracked appMonitoringChecked: boolean = true;
  @tracked filterApplied: boolean = false;

  @action
  handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleOptionsClose() {
    this.anchorRef = null;
  }

  @action
  toggleVapt() {
    this.vapChecked = !this.vapChecked;
    this.updateFilterApplied();
  }

  @action
  toggleAppMonitoring() {
    this.appMonitoringChecked = !this.appMonitoringChecked;
    this.updateFilterApplied();
  }

  updateFilterApplied() {
    this.filterApplied = this.vapChecked || this.appMonitoringChecked;
  }

  @action
  clearFilter() {
    this.vapChecked = true;
    this.appMonitoringChecked = true;
    this.filterApplied = false;

    this.anchorRef = null;
  }

  get selectedProducts() {
    const products = [];

    if (this.vapChecked) {
      products.push(ENUMS.SK_AVAILABILITY.VAPT);
    }

    if (this.appMonitoringChecked) {
      products.push(ENUMS.SK_AVAILABILITY.APP_MONITORING);
    }

    return products;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::UserManagement::Users::Table::ProductAccessHeader': typeof AdminUserManagementUsersTableProductAccessHeaderComponent;
  }
}
