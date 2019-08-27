import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  buildURL(modelName, id) {
    let url = `${this.host}/${this.get('namespace')}/profiles/${id}/proxy_settings`;
    return url;
  }
});
