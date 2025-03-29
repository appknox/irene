import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload) {
    return {
      data: {
        id: '1', // Static ID
        type: 'organization-ai-feature',
        attributes: payload,
      },
    };
  },
});
