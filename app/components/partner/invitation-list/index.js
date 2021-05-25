import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerInvitationListComponent extends PaginationMixin(Component) {
  @service intl;
  @service store;
  @service realtime;
  @service('notifications') notify;

  @tracked isLoading = true;
  @tracked refresh = false;

  @reads('objects') requests;

  constructor() {
    super(...arguments);
    this.realtime.addObserver('RegistrationRequestCounter', this, 'registrationRequestDidChange');
  }

  targetModel = 'partner/registration-request';
  sortProperties = 'updatedOn:asc';
  get extraQueryStrings() {
    return JSON.stringify({
      status: "approved",
      is_activated: false
    });
  }

  registrationRequestDidChange() {
    this.refresh = !this.refresh;
  }
}
