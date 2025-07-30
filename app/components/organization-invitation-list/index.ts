import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type OrganizationModel from 'irene/models/organization';
import type OrganizationMemberModel from 'irene/models/organization-member';
import type RealtimeService from 'irene/services/realtime';

type InvitationQueryResponse =
  DS.AdapterPopulatedRecordArray<OrganizationMemberModel> & {
    meta?: { count: number };
  };

interface ColumnsInterface {
  name: string;
  valuePath?: string;
  minWidth?: number;
  component?:
    | 'organization-invitation-list/invite-type'
    | 'organization-invitation-list/invite-delete'
    | 'organization-invitation-list/invite-resend'
    | 'organization-invitation-list/invited-on';
  textAlign?: 'center' | 'left';
}

interface ExtraQueryStringsInterface {
  teamId?: string | number;
  is_accepted?: boolean;
  q?: string;
}

interface OrganizationInvitationListSignature {
  Args: {
    organization: OrganizationModel | null;
    limit?: number;
    offset?: number;
    targetModel?: string;
    columns?: ColumnsInterface[];
    itemPerPageOptions?: number[];
    blurConfirmBoxOverlay?: boolean;
    paginationVariant?: 'default' | 'compact';
    extraQueryStrings?: ExtraQueryStringsInterface;
    queryParams?: { invite_limit: number; invite_offset: number };
  };
  Blocks: {
    empty: [];
    loading: [];
    headerContent: [];
  };
}
/**
 * This Component is used in organization-team-invitation too
 * params overriding -> extraQueryStrings, columns & targetModel
 */
export default class OrganizationInvitationListComponent extends Component<OrganizationInvitationListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare realtime: RealtimeService;
  @service('notifications') declare notify: NotificationService;

  @tracked inviteResponse: InvitationQueryResponse | null = null;
  @tracked query = '';

  constructor(
    owner: unknown,
    args: OrganizationInvitationListSignature['Args']
  ) {
    super(owner, args);

    this.fetchInvites.perform();
  }

  get reloadInvitesDependencies() {
    return {
      invitationCounter: () => this.realtime.InvitationCounter,
    };
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
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
    return this.inviteResponse?.slice() || [];
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

  get setQueryParams() {
    return Boolean(this.args.queryParams);
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
          component: 'organization-invitation-list/invite-type' as const,
        },
        {
          name: this.intl.t('invitedOn'),
          component: 'organization-invitation-list/invited-on' as const,
        },
        {
          name: this.intl.t('resend'),
          component: 'organization-invitation-list/invite-resend' as const,
          textAlign: 'center',
        },
        {
          name: this.intl.t('delete'),
          component: 'organization-invitation-list/invite-delete' as const,
          textAlign: 'center',
        },
      ]
    );
  }

  @action
  reloadInvites() {
    this.fetchInvites.perform();
  }

  @action
  handleNextPrevAction({ limit, offset }: PaginationProviderActionsArgs) {
    if (this.setQueryParams) {
      this.setRouteQueryParams(limit, offset);
    }

    this.fetchInvites.perform();
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    if (this.setQueryParams) {
      this.setRouteQueryParams(limit, 0);
    }

    this.fetchInvites.perform();
  }

  @action
  setRouteQueryParams(limit = 10, offset = 0) {
    this.router.transitionTo({
      queryParams: {
        invite_limit: limit,
        invite_offset: offset,
      },
    });
  }

  fetchInvites = task({ drop: true }, async () => {
    const q = this.extraQueryStrings.q ? this.extraQueryStrings.q : this.query;

    try {
      this.inviteResponse = await this.store.query(this.targetModel, {
        limit: this.limit,
        offset: this.offset,
        ...this.extraQueryStrings,
        q,
      });
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationInvitationList: typeof OrganizationInvitationListComponent;
  }
}
