import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class OrganizationAiFeatureSerializer extends DRFSerializer {
  normalizeResponse(
    _store: unknown,
    _primaryModelClass: unknown,
    payload: Record<string, unknown>
  ) {
    return {
      data: {
        id: '1', // Static ID
        type: 'organization-ai-feature',
        attributes: payload,
      },
    };
  }
}
