import DS from 'ember-data';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

const ApplicationAdapter = DS.JSONAPIAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
}
);

export default ApplicationAdapter;
