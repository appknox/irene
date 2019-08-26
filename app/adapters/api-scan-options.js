import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  urlForQueryRecord: function (q) {
    let url = `${this.host}/${this.get('namespace')}/profiles/${q.id}/api_scan_options`;
    return url;
  }
});
