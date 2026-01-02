import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import { type ArchiveListRef } from '..';
import type OrganizationService from 'irene/services/organization';
import type OrganizationArchiveModel from 'irene/models/organization-archive';

interface OrganizationArchiveListSignature {
  Args: {
    ref: ArchiveListRef;
  };
}

type OrganizationArchiveResponse =
  DS.AdapterPopulatedRecordArray<OrganizationArchiveModel> & {
    meta: { count: number };
  };

export default class OrganizationArchiveListComponent extends Component<OrganizationArchiveListSignature> {
  @service declare organization: OrganizationService;
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked archiveResponse: OrganizationArchiveResponse | null = null;

  constructor(owner: unknown, args: OrganizationArchiveListSignature['Args']) {
    super(owner, args);

    this.args.ref.reloadArchiveList = this.handleReloadArchiveList;

    this.fetchArchives.perform(this.limit, this.offset);
  }

  get archiveList() {
    return this.archiveResponse?.slice() || [];
  }

  get totalArchiveCount() {
    return this.archiveResponse?.meta?.count || 0;
  }

  get hasNoArchive() {
    return this.totalArchiveCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('organizationTableCreatedOn'),
        component: 'organization-archive/list/created-on',
      },
      {
        name: this.intl.t('organizationTableGeneratedBy'),
        component: 'organization-archive/list/generated-by',
      },
      {
        name: this.intl.t('reportType'),
        component: 'organization-archive/list/report-type',
      },
      {
        name: this.intl.t('status'),
        component: 'organization-archive/list/status',
        textAlign: 'center',
      },
      {
        name: this.intl.t('action'),
        component: 'organization-archive/list/action',
        textAlign: 'center',
      },
    ];
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchArchives.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchArchives.perform(limit, 0);
  }

  @action
  handleReloadArchiveList() {
    this.fetchArchives.perform(this.limit, this.offset);
  }

  fetchArchives = task(async (limit, offset) => {
    try {
      const queryParams = {
        limit,
        offset,
      };

      this.archiveResponse = (await this.store.query(
        'organization-archive',
        queryParams
      )) as OrganizationArchiveResponse;
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationArchive::List': typeof OrganizationArchiveListComponent;
  }
}
