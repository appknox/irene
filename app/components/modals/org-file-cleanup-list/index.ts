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
import OrganizationCleanupModel from 'irene/models/organization-cleanup';

type OrganizationCleanupResponseModel =
  DS.AdapterPopulatedRecordArray<OrganizationCleanupModel> & {
    meta?: { count: number };
  };

export default class OrgFileCleanupListComponent extends Component {
  @service declare intl: IntlService;
  @service declare notify: NotificationService;
  @service declare store: Store;

  @tracked
  organizationCleanupReponse: OrganizationCleanupResponseModel | null = null;

  @tracked limit = 10;
  @tracked offset = 0;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchOrganizationCleanup.perform(this.limit, this.offset);
  }

  get organizationCleanupList() {
    return this.organizationCleanupReponse?.toArray() || [];
  }

  get totalOrganizationCleanupCount() {
    return this.organizationCleanupReponse?.meta?.count || 0;
  }

  get hasNoOrganizationCleanup() {
    return this.totalOrganizationCleanupCount === 0;
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchOrganizationCleanup.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchOrganizationCleanup.perform(limit, 0);
  }

  fetchOrganizationCleanup = task(async (limit, offset) => {
    try {
      this.organizationCleanupReponse = await this.store.query(
        'organization-cleanup',
        {
          limit,
          offset,
        }
      );
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Modals::OrgFileCleanupList': typeof OrgFileCleanupListComponent;
  }
}
