import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({

  payloadData(item) {
    return {
      id: item.id,
      type: 'security/pcidss',
      attributes: {
        code: item.attributes.code,
        title: item.attributes.title,
        description: item.attributes.description
      }
    };
  },

  normalizeResponse: function (store, primaryModelClass, payload) {

    if(payload.data.id) {
      return {
        data: this.payloadData(payload.data)
      };
    }
    else {
      return {
        data: payload.data.map((item)=> {
          return this.payloadData(item);
        })
      };
    }
  }
});
