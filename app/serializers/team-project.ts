import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from '@ember-data/store';
import type TeamProjectModel from 'irene/models/team-project';

interface TeamProjectPayload {
  results: {
    id: string;
    package_name: string;
  }[];
}

export default class TeamProjectSerializer extends DRFSerializer {
  normalizeResponse(
    _store: Store,
    _primaryModelClass: TeamProjectModel,
    payload: TeamProjectPayload
  ) {
    return {
      data: payload.results.map((item) => {
        return {
          id: item.id,
          type: 'team-project',
          attributes: {
            name: item.package_name,
          },
        };
      }),
    };
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'team-project': TeamProjectSerializer;
  }
}
