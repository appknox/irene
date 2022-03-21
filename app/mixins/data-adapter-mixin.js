/* eslint-disable ember/no-mixins, prettier/prettier, ember/no-new-mixins, ember/no-get */
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import Mixin from '@ember/object/mixin';


const IreneAdapterMixin = Mixin.create(DataAdapterMixin, {
  get headers() {
    const data = this.get('session.data.authenticated')
    if (data && data.b64token) {
      return {
        'Authorization': `Basic ${data.b64token}`,
        'X-Product': ENV.product
      }
    }
    return {
      'X-Product': ENV.product
    };
  }
})
 export default IreneAdapterMixin;
