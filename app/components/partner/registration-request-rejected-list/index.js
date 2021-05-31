import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerRegistrationRequestRejectedListComponent extends PaginationMixin(
  Component
) {
  @service intl;
  @service realtime;
  @service('notifications') notify;

  constructor() {
    super(...arguments);
    this.realtime.addObserver(
      'RegistrationRequestCounter',
      this,
      'registrationRequestDidChange'
    );
  }

  targetModel = 'partner/registration-request';
  sortProperties = 'createdOn:desc';
  get extraQueryStrings() {
    return JSON.stringify({
      approval_status: 'rejected',
      is_activated: false,
    });
  }

  async registrationRequestDidChange() {
    await this.reload();
    if (this.offset > 0 && this.objects.length == 0) {
      this.gotoPageFirst();
    }
  }

  @task(function* (request) {
    try {
      yield request.updateStatus('pending');
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(
        `${this.intl.t('movedRequestToPending')}: ${request.email}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  undoRejectRequest;

  @action
  onUndoReject(request) {
    this.undoRejectRequest.perform(request);
  }
}
