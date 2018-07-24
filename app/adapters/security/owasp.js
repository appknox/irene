import DS from 'ember-data';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:irene',
  host: ENV.host,
  namespace: "api",

  findAll: function findAll() {
    let url = `${this.get('host')}/${this.get('namespace')}/owasps`;
    return this.ajax(url, 'GET');
  }

});
