import DRFSerializer from 'ember-django-adapter/serializers/drf';

interface TeamInvitationItem {
  uuid: string;
  email: string;
}

interface TeamInvitationPayload {
  results: TeamInvitationItem[];
}

export default class TeamInvitationSerializer extends DRFSerializer {
  normalizeResponse(
    _store: unknown,
    _primaryModelClass: unknown,
    payload: TeamInvitationPayload
  ) {
    return {
      data: payload.results.map((item) => {
        return {
          id: item.uuid,
          type: 'team-invitation',
          attributes: {
            email: item.email,
          },
        };
      }),
    };
  }
}
