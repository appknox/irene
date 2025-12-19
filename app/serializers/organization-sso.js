import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload) {
    // If the response is a single object, not a list
    const item = payload;

    return {
      data: {
        id: item.id || 'sso-id',
        type: 'organization-sso',
        attributes: {
          enabled: item.enabled,
          enforced: item.enforced,
        },
      },
    };
  },
});
