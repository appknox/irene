import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class OrganizationArchiveListComponent extends Component {
  @service organization;
  @service intl;
  @service store;
  @service('notifications') notify;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked archiveResponse = null;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    this.args.ref.reloadArchiveList = this.handleReloadArchiveList;

    this.fetchArchives.perform(this.limit, this.offset);
  }

  get archiveList() {
    return this.archiveResponse?.toArray() || [];
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
        component: 'organization-archive/list/archive-created-on',
      },
      {
        name: this.intl.t('organizationTableGeneratedBy'),
        valuePath: 'generatedBy.username',
      },
      {
        name: this.intl.t('organizationTableDuration'),
        component: 'organization-archive/list/archive-duration',
      },
      {
        name: this.intl.t('status'),
        component: 'organization-archive/list/archive-status',
        textAlign: 'center',
      },
      {
        name: this.intl.t('action'),
        component: 'organization-archive/list/archive-action',
        textAlign: 'center',
      },
    ];
  }

  @action
  handleNextPrevAction({ limit, offset }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchArchives.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }) {
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

      this.archiveResponse = await this.store.query(
        'organization-archive',
        queryParams
      );
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}
