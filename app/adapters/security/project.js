import ENV from 'irene/config/environment';
import DRFAdapter from 'irene/adapters/drf';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: 'api/hudson-api',
  addTrailingSlashes: false,
  pathForType() {
    return 'projects';
  }
});
