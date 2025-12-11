import DRFSerializer from 'ember-django-adapter/serializers/drf';

interface TrackersPayload {
  results: Array<Record<string, unknown> & { id: string }>;
  count: number;
}

export default class TrackersSerializer extends DRFSerializer {
  normalizeResponse(
    _store: unknown,
    _primaryModelClass: unknown,
    payload: TrackersPayload
  ) {
    return {
      data: payload.results.map((item) => {
        return {
          id: item.id,
          type: 'trackers',
          attributes: item,
        };
      }),
      meta: { count: payload.count },
    };
  }
}
