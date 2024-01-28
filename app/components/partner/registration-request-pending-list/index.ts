/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import RealtimeService from 'irene/services/realtime';
import PartnerRegistrationRequestModel from 'irene/models/partner/registration-request';

type PartnerRegistrationRequestResponseModel =
  DS.AdapterPopulatedRecordArray<PartnerRegistrationRequestModel> & {
    meta?: { count: number };
  };

export default class PartnerRegistrationRequestPendingListComponent extends Component {
  @service declare realtime: RealtimeService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked
  partnerRegistrationRequestReponse: PartnerRegistrationRequestResponseModel | null =
    null;

  @tracked hasErrored = false;
  @tracked limit = 10;
  @tracked offset = 0;

  sortProperties = ['createdOn:desc'];

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchPartnerRegistrationRequest.perform(this.limit, this.offset);

    this.realtime.addObserver(
      'RegistrationRequestCounter',
      this,
      this.registrationRequestDidChange
    );
  }

  willDestroy() {
    super.willDestroy();

    this.realtime.removeObserver(
      'RegistrationRequestCounter',
      this,
      this.registrationRequestDidChange
    );
  }

  async registrationRequestDidChange() {
    // After item removal if no items exist in the page then redirect to first page
    if (
      this.offset > 0 &&
      this.partnerRegistrationRequestReponse?.length === 0
    ) {
      this.offset = 0;
    }

    await this.fetchPartnerRegistrationRequest.perform(this.limit, this.offset);
  }

  get partnerRegistrationRequestList() {
    return (
      this.partnerRegistrationRequestReponse
        ?.toArray()
        .sortBy(...this.sortProperties) || []
    );
  }

  get totalPartnerRegistrationRequestCount() {
    return this.partnerRegistrationRequestReponse?.meta?.count || 0;
  }

  get hasNoPartnerRegistrationRequest() {
    return this.totalPartnerRegistrationRequestCount === 0;
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchPartnerRegistrationRequest.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchPartnerRegistrationRequest.perform(limit, 0);
  }

  @action
  onApprove(request: PartnerRegistrationRequestModel) {
    this.approveRequest.perform(request);
  }

  @action
  onReject(request: PartnerRegistrationRequestModel) {
    this.rejectRequest.perform(request);
  }

  approveRequest = task(async (request: PartnerRegistrationRequestModel) => {
    try {
      await request.updateStatus('approved');

      this.realtime.incrementProperty('RegistrationRequestCounter');

      this.notify.success(
        `${this.intl.t('sentInvitationTo')} ${request.email}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  rejectRequest = task(async (request: PartnerRegistrationRequestModel) => {
    try {
      await request.updateStatus('rejected');

      this.realtime.incrementProperty('RegistrationRequestCounter');

      this.notify.success(
        `${this.intl.t('rejectedRequestFrom')} ${request.email}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  fetchPartnerRegistrationRequest = task(async (limit, offset) => {
    try {
      this.hasErrored = false;

      this.partnerRegistrationRequestReponse = await this.store.query(
        'partner/registration-request',
        {
          limit,
          offset,
          approval_status: 'pending',
          is_activated: false,
        }
      );
    } catch (e) {
      this.hasErrored = true;

      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::RegistrationRequestPendingList': typeof PartnerRegistrationRequestPendingListComponent;
  }
}
