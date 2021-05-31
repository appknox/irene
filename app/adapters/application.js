import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

const ApplicationAdapter = JSONAPIAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
});

export default ApplicationAdapter;
