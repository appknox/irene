import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedOrganizationTeamsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  queryParams = {
    team_limit: {
      refreshModel: true,
    },
    team_offset: {
      refreshModel: true,
    },
    team_query: {
      refreshModel: true,
    },
  };

  model({ team_limit = 10, team_offset = 0, team_query = '' }) {
    return {
      queryParams: {
        team_limit: Number(team_limit),
        team_offset: Number(team_offset),
        team_query,
      },
    };
  }
}
