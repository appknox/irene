import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

/**
 * This Component is used in organization-team-invitation too
 * params overriding -> extraQueryStrings, columns & targetModel
 */
export default class OrganizationInvitationListComponent extends Component {
  @service intl;
  @service store;
  @service router;
  @service('notifications') notify;

  @tracked inviteResponse = null;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    this.fetchInvites.perform(this.limit, this.offset, '', false);
  }

  get limit() {
    return this.args.queryParams
      ? this.args.queryParams.invite_limit
      : this.args.limit;
  }

  get offset() {
    return this.args.queryParams
      ? this.args.queryParams.invite_offset
      : this.args.offset;
  }

  get itemPerPageOptions() {
    return this.args.itemPerPageOptions || [10, 25, 50];
  }

  get inviteList() {
    return this.inviteResponse?.toArray() || [];
  }

  get totalInviteCount() {
    return this.inviteResponse?.meta?.count || 0;
  }

  get hasNoInvite() {
    return this.totalInviteCount === 0;
  }

  get targetModel() {
    return this.args.targetModel || 'organization-invitation';
  }

  get extraQueryStrings() {
    return (
      this.args.extraQueryStrings || {
        is_accepted: false,
      }
    );
  }

  get columns() {
    return (
      this.args.columns || [
        {
          name: this.intl.t('email'),
          valuePath: 'email',
          minWidth: 150,
        },
        {
          name: this.intl.t('inviteType'),
          component: 'organization-invitation-list/invite-type',
        },
        {
          name: this.intl.t('invitedOn'),
          component: 'organization-invitation-list/invited-on',
        },
        {
          name: this.intl.t('resend'),
          component: 'organization-invitation-list/invite-resend',
          textAlign: 'center',
        },
        {
          name: this.intl.t('delete'),
          component: 'organization-invitation-list/invite-delete',
          textAlign: 'center',
        },
      ]
    );
  }

  @action
  handleNextPrevAction({ limit, offset }) {
    const setQueryParams = Boolean(this.args.queryParams);

    this.fetchInvites.perform(limit, offset, '', setQueryParams);
  }

  @action
  handleItemPerPageChange({ limit }) {
    const setQueryParams = Boolean(this.args.queryParams);

    this.fetchInvites.perform(limit, 0, '', setQueryParams);
  }

  setRouteQueryParams(limit, offset) {
    this.router.transitionTo({
      queryParams: {
        invite_limit: limit,
        invite_offset: offset,
      },
    });
  }

  @action
  handleReloadInvites() {
    const setQueryParams = Boolean(this.args.queryParams);

    this.fetchInvites.perform(this.limit, this.offset, '', setQueryParams);
  }

  fetchInvites = task(
    { drop: true },
    async (limit, offset, query = '', setQueryParams = true) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        this.inviteResponse = await this.store.query(this.targetModel, {
          limit,
          offset,
          q: query,
          ...this.extraQueryStrings,
        });
      } catch (err) {
        let errMsg = this.tPleaseTryAgain;

        if (err.errors && err.errors.length) {
          errMsg = err.errors[0].detail || errMsg;
        } else if (err.message) {
          errMsg = err.message;
        }

        this.notify.error(errMsg);
      }
    }
  );
}
