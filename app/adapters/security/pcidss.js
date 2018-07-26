import DS from 'ember-data';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:irene',
  host: ENV.host,
  namespace: "api",
  addTrailingSlashes: false,

  _buildURL: function _buildURL(modelName, id) {
    if(id) {
      return `${this.get('host')}/${this.get('namespace')}/pcidsses/${id}`;
    }
    return `${this.get('host')}/${this.get('namespace')}/pcidsses`;
  }

});
