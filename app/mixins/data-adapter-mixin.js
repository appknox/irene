import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import Mixin from '@ember/object/mixin';


const IreneAdapterMixin = Mixin.create(DataAdapterMixin,{
  authorize(xhr){
    const data = this.get('session.data.authenticated');
    if (data && data.b64token){
      xhr.setRequestHeader('Authorization', `Basic ${data.b64token}`);
    }
    xhr.setRequestHeader('X-Product', ENV.product);
  }
})
 export default IreneAdapterMixin;
