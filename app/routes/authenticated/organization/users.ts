import Route from '@ember/routing/route';

export interface OrganizationMembersRouteQueryParams {
  user_limit: number;
  user_offset: number;
  user_query: string;
  show_inactive_user: boolean;
  invite_limit: number;
  invite_offset: number;
}

export default class AuthenticatedOrganizationMembersRoute extends Route {
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
  activate() {
    window.scrollTo(0, 0);
  }

  model(params: Partial<OrganizationMembersRouteQueryParams>) {
    const {
      user_limit,
      user_offset,
      user_query,
      show_inactive_user,
      invite_limit,
      invite_offset,
    } = params;

    return {
      queryParams: {
        user_limit,
        user_offset,
        user_query,
        show_inactive_user,
        invite_limit,
        invite_offset,
      },
    };
  }
}
