import ENV from 'irene/config/environment';
import DRFAdapter from 'irene/adapters/drf';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:irene',
  host: ENV.host,
  namespace: "hudson-api",
  addTrailingSlashes: false,

  _buildURL: function _buildURL(modelName, id) {
    if(id) {
      return `${this.get('host')}/${this.get('namespace')}/analyses/${id}`;
    }
    else {
      return `${this.get('host')}/${this.get('namespace')}/analyses`
    }
  }
});
