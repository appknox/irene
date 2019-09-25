import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,

  _buildURL: function () {
    const baseURL = `${this.get('host')}/${this.get('namespace')}/v2/mfa`;
    return baseURL;
  },
});
