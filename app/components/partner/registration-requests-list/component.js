import Component from '@glimmer/component';
import {
  tracked
} from '@glimmer/tracking';
import {
  computed,
  set
} from '@ember/object';
import {
  PaginationMixin
} from '../../../mixins/paginate';
import {
  task
} from 'ember-concurrency';
import {
  inject as service
} from '@ember/service';
import parseError from 'irene/utils/parse-error';
import {
  reads
} from '@ember/object/computed';

export default class PartnerRegistrationRequestsListComponent extends PaginationMixin(Component) {

  @service store;
  @service('notifications') notify;

  @tracked isLoading = true;

  @reads('objects') requests;

  targetModel = 'registration-request';

  @computed('args.status')
  get extraQueryStrings() {
    return JSON.stringify({
      status: this.args.status,
      is_activated: false
    })
  }

  @computed('args.status')
  get isPending() {
    return this.args.status == 'pending';
  }

  @computed('args.status')
  get isRejected() {
    return this.args.status == 'rejected';
  }

  @computed('args.status')
  get isApproved() {
    return this.args.status == 'approved';
  }

  @task(function* (request) {
    try {
      yield request.updateStatus({
        approval_status: 'approved'
      }, request.id);
      this.animateRowVisibility(request);
      this.notify.success("Request approved successfully")
    } catch (err) {
      this.notify.error(parseError(err));
    }
  }) inviteByApprove;

  @task(function* (request) {
    try {
      yield request.updateStatus({
        approval_status: 'rejected'
      }, request.id);

      this.animateRowVisibility(request);

      this.notify.success("Request rejected successully")
    } catch (err) {
      this.notify.error(parseError(err));
    }
  }) rejectRequest;

  @task(function* (request) {
    try {
      yield request.updateStatus({
        approval_status: 'pending'
      }, request.id);
      this.animateRowVisibility(request);
      this.notify.success("Rejection undone successfully")
    } catch (err) {
      this.notify.error(parseError(err));
    }
  }) undoReject;

  @task(function* (request) {
    try {
      const updatedReq = yield request.resend(request.id);
      console.log('updatedReq', updatedReq)
      set(request, 'updatedOn', updatedReq.updated_on);
      set(request, 'validUntil', updatedReq.valid_until);
      this.notify.success("Invitation sent again")
    } catch (err) {
      this.notify.error(parseError(err));
    }
  }) resendInvite;

  animateRowVisibility(row) {
    set(row, 'tempClass', 'fade-in');
    setTimeout(() => {
      const element = document.querySelector(`[data-registration-requests-row-id="${row.id}"]`);
      if (element) {
        element.parentNode.removeChild(element);
      }
      set(row, 'tempClass', undefined);
    }, 500);
  }
}
