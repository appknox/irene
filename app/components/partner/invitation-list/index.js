/* eslint-disable ember/no-mixins, ember/no-observers */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerInvitationListComponent extends PaginationMixin(
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
  sortProperties = 'updatedOn:asc';
  get extraQueryStrings() {
    return JSON.stringify({
      approval_status: 'approved',
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
      yield request.resend();
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(
        `${this.intl.t('resentInvitationTo')} ${request.email}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resendInvite;

  @task(function* (request) {
    try {
      const email = request.email;
      yield request.destroyRecord();
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(`${this.intl.t('deletedInvitationOf')} ${email}`);
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  deleteInvite;

  @action
  onResend(request) {
    this.resendInvite.perform(request);
  }

  @action
  onDelete(request) {
    this.deleteInvite.perform(request);
  }
}
