import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: payload.data.map((item)=> {
        return {
          id: item.id,
          type: 'organization-user',
          attributes: {
            role: item.attributes.role,
            username: item.attributes.username,
            email: item.attributes.email
          }
        };
      })
    };
  }
});
