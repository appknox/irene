import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from '@ember-data/store';
import type TeamInvitationModel from 'irene/models/team-invitation';

interface TeamInvitationItem {
  uuid: string;
  email: string;
}

interface TeamInvitationPayload {
  results: TeamInvitationItem[];
}

export default class TeamInvitationSerializer extends DRFSerializer {
  normalizeResponse(
    _store: Store,
    _primaryModelClass: TeamInvitationModel,
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

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'team-invitation': TeamInvitationSerializer;
  }
}
