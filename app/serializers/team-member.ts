import DRFSerializer from 'ember-django-adapter/serializers/drf';

interface TeamMemberItem {
  id: string;
  username: string;
  email: string;
}

interface TeamMemberPayload {
  results: TeamMemberItem[];
}

export default class TeamMemberSerializer extends DRFSerializer {
  normalizeResponse(
    _store: unknown,
    _primaryModelClass: unknown,
    payload: TeamMemberPayload
  ) {
    return {
      data: payload.results.map((item) => {
        return {
          id: item.id,
          type: 'team-member',
          attributes: {
            username: item.username,
            email: item.email,
          },
        };
      }),
    };
  }
}
