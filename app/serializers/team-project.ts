import DRFSerializer from 'ember-django-adapter/serializers/drf';

interface TeamProjectPayload {
  results: {
    id: string;
    package_name: string;
  }[];
}

export default class TeamProjectSerializer extends DRFSerializer {
  normalizeResponse(
    _store: unknown,
    _primaryModelClass: unknown,
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
