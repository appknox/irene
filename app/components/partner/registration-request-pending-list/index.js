import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerRegistrationRequestPendingListComponent extends PaginationMixin(Component) {
  @service intl;
  @service realtime;
  @service('notifications') notify;

  constructor() {
    super(...arguments);
    this.realtime.addObserver('RegistrationRequestCounter', this, 'registrationRequestDidChange');
  }

  targetModel = 'partner/registration-request';
  sortProperties = 'createdOn:desc';
  get extraQueryStrings() {
    return JSON.stringify({
      status: "pending",
      is_activated: false
    });
  }

  registrationRequestDidChange() {
    this.refresh = !this.refresh;
  }
}
