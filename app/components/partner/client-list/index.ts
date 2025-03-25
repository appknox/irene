import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';

import PartnerService from 'irene/services/partner';

import PartnerclientModel from 'irene/models/partner/partnerclient';
import parseError from 'irene/utils/parse-error';

type PartnerClientResponseModel =
  DS.AdapterPopulatedRecordArray<PartnerclientModel> & {
    meta?: { count: number };
  };

export default class PartnerClientListComponent extends Component {
  @service declare partner: PartnerService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked partnerClientReponse: PartnerClientResponseModel | null = null;
  @tracked hasErrored = false;
  @tracked limit = 10;
  @tracked offset = 0;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchPartnerClient.perform(this.limit, this.offset);
  }

  get partnerClientList() {
    return this.partnerClientReponse?.slice() || [];
  }

  get totalParnterClientCount() {
    return this.partnerClientReponse?.meta?.count || 0;
  }

  get hasNoParnterClient() {
    return this.totalParnterClientCount === 0;
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchPartnerClient.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchPartnerClient.perform(limit, 0);
  }

  fetchPartnerClient = task(async (limit, offset) => {
    try {
      this.hasErrored = false;

      this.partnerClientReponse = await this.store.query(
        'partner/partnerclient',
        {
          limit,
          offset,
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
    'Partner::ClientList': typeof PartnerClientListComponent;
  }
}
