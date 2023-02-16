/* eslint-disable ember/no-mixins */
import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../../mixins/scroll-top';

export default class AuthenticatedOrganizationMembersRoute extends ScrollTopMixin(
  Route
) {
  queryParams = {
    user_limit: {
      refreshModel: true,
    },
    user_offset: {
      refreshModel: true,
    },
    user_query: {
      refreshModel: true,
    },
    show_inactive_user: {
      refreshModel: true,
    },
    invite_limit: {
      refreshModel: true,
    },
    invite_offset: {
      refreshModel: true,
    },
  };

  model({
    user_limit = 10,
    user_offset = 0,
    user_query = '',
    show_inactive_user,
    invite_limit = 10,
    invite_offset = 0,
  }) {
    return {
      queryParams: {
        user_limit: Number(user_limit),
        user_offset: Number(user_offset),
        user_query,
        show_inactive_user: show_inactive_user === 'true',
        invite_limit: Number(invite_limit),
        invite_offset: Number(invite_offset),
      },
    };
  }
}
