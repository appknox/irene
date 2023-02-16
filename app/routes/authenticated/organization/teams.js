/* eslint-disable ember/no-mixins, prettier/prettier */
import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../../mixins/scroll-top';

export default class AuthenticatedOrganizationTeamsRoute extends ScrollTopMixin(
  Route
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
