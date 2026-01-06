import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from '@ember-data/store';
import type TrackersModel from 'irene/models/trackers';

interface TrackersPayload {
  results: Array<Record<string, unknown> & { id: string }>;
  count: number;
}

export default class TrackersSerializer extends DRFSerializer {
  normalizeResponse(
    _store: Store,
    _primaryModelClass: TrackersModel,
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

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    trackers: TrackersSerializer;
  }
}
