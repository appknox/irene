import DS from 'ember-data';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

const ApplicationAdapter = DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  authorizer: 'authorizer:irene'
}
);

export default ApplicationAdapter;
