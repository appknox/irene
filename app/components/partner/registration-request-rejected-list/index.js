import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject } from '@ember/service';
import { reads } from '@ember/object/computed';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerRegistrationRequestRejectedListComponent extends PaginationMixin(Component) {
  @inject intl;
  @inject store;
  @inject realtime;
  @inject('notifications') notify;

  @tracked isLoading = true;
  @tracked refresh = false;

  @reads('objects') requests;

  constructor() {
    super(...arguments);
    this.realtime.addObserver('RegistrationRequestCounter', this, 'registrationRequestDidChange');
  }

  targetModel = 'registration-request';
  sortProperties = 'createdOn:desc';
  get extraQueryStrings() {
    return JSON.stringify({
      status: "rejected",
      is_activated: false
    });
  }

  registrationRequestDidChange() {
    this.refresh = !this.refresh;
  }
}
