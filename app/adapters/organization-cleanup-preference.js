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
    return  `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/cleanup-preference`;
  }
});
