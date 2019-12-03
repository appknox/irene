import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  pathForType(type) {
    return type;
  },
  extendTime(snapshot, time) {
    const id = snapshot.id;
    const modelName = snapshot.constructor.modelName;
    const url = this.buildURL(modelName, id) + '/extend'
    return this.ajax(url, 'POST', {
      data: {time}
    });
  },
});
