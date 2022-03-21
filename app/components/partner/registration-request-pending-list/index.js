/* eslint-disable ember/no-mixins, ember/no-observers */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerRegistrationRequestPendingListComponent extends PaginationMixin(
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
      approval_status: 'pending',
      is_activated: false,
    });
  }

  async registrationRequestDidChange() {
    await this.reload();
    // After item removal if no items exist in the page then redirect to first page
    if (this.offset > 0 && this.objects.length == 0) {
      this.gotoPageFirst();
    }
  }

  @task(function* (request) {
    try {
      yield request.updateStatus('approved');
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(
        `${this.intl.t('sentInvitationTo')} ${request.email}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  approveRequest;

  @task(function* (request) {
    try {
      yield request.updateStatus('rejected');
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(
        `${this.intl.t('rejectedRequestFrom')} ${request.email}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  rejectRequest;

  @action
  onApprove(request) {
    this.approveRequest.perform(request);
  }

  @action
  onReject(request) {
    this.rejectRequest.perform(request);
  }
}
