import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: payload.data.map((item)=> {
        return {
          id: item.id,
          type: 'organization-invitation',
          attributes: {
            role: item.attributes.role,
            email: item.attributes.email
          }
        };
      })
    };
  }
});
