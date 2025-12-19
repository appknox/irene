/* eslint-disable prettier/prettier */
import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: payload.results.map((item)=> {
        return {
          id: item.uuid,
          type: 'team-invitation',
          attributes: {
            email: item.email
          }
        };
      })
    };
  }
});
