/* eslint-disable ember/no-mixins */
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default class ApplicationAdapter extends JSONAPIAdapter.extend(
  IreneAdapterMixin
) {
  host = ENV.host;
  namespace = ENV.namespace;
}
