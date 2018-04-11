import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload, id, requestType) {
    return {
      data: payload.data.map((item)=> {
        return {
          id: item.id,
          type: 'organization-user',
          attributes: {
            username: item.attributes.username,
            email: item.attributes.email
          }
        }
      })
    };
  }
});
