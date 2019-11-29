import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';
import { inject as service } from '@ember/service';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  organization: service('organization'),

  _buildURL() {
    const baseUrl = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/sso/saml2/idp_metadata`;
    return baseUrl;
  },

  async deleteIdPMetadata(modelInstance) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL();
    await this.ajax(url, 'DELETE');
    return this.store.peekRecord('saml2-idp-metadata', modelId);
  },
});
