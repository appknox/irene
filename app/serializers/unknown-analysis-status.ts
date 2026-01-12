import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from '@ember-data/store';
import type UnknownAnalysisStatusModel from 'irene/models/unknown-analysis-status';

interface UnknownAnalysisStatusPayload {
  id: string;
  status: unknown;
}

export default class UnknownAnalysisStatusSerializer extends DRFSerializer {
  normalizeResponse(
    _store: Store,
    _primaryModelClass: UnknownAnalysisStatusModel,
    payload: UnknownAnalysisStatusPayload
  ) {
    return {
      data: {
        id: payload.id,
        type: 'unknown-analysis-status',
        attributes: {
          status: payload.status,
        },
      },
    };
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'unknown-analysis-status': UnknownAnalysisStatusSerializer;
  }
}
