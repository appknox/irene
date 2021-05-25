import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { reads }  from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerRegistrationRequestPendingListComponent extends PaginationMixin(Component) {
  @service intl;
  @service store;
  @service realtime;
  @service('notifications') notify;
  @service network;

  @tracked isLoading = true;
  @tracked error = null;
  @tracked refresh = false;

  @reads('objects') requests;

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
