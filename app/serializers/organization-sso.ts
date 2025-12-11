import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class OrganizationSsoSerializer extends DRFSerializer {
  normalizeResponse(
    _store: unknown,
    _primaryModelClass: unknown,
    payload: Record<string, unknown>
  ) {
    const item = payload;

    return {
      data: {
        id: item['id'] || 'sso-id',
        type: 'organization-sso',
        attributes: {
          enabled: item['enabled'],
          enforced: item['enforced'],
        },
      },
    };
  }
}
