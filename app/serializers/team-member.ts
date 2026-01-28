import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from 'ember-data/store';
import type TeamMemberModel from 'irene/models/team-member';

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
    _store: Store,
    _primaryModelClass: TeamMemberModel,
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

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'team-member': TeamMemberSerializer;
  }
}
