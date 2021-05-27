import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerInvitationListComponent extends PaginationMixin(Component) {
  @service intl;
  @service realtime;
  @service('notifications') notify;

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
