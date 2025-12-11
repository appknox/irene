import DRFSerializer from 'ember-django-adapter/serializers/drf';

interface UnknownAnalysisStatusPayload {
  id: string;
  status: unknown;
}

export default class UnknownAnalysisStatusSerializer extends DRFSerializer {
  normalizeResponse(
    _store: unknown,
    _primaryModelClass: unknown,
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
