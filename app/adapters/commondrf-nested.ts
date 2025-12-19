import CommonDRFAdapter from './commondrf';
import { underscore } from '@ember/string';
import type ModelRegistry from 'ember-data/types/registries/model';

export default class CommondrfNestedAdapter extends CommonDRFAdapter {
  namespace = '';
  pathTypeName: keyof ModelRegistry | null = null;

  pathForType(type: keyof ModelRegistry) {
    return underscore(super.pathForType(this.pathTypeName || type));
  }

  handleResponse(
    status: number,
    headers: object,
    payload: object,
    requestData: object
  ) {
    if (status >= 400 && this.namespace === '') {
      throw new Error(
        'setNestUrlNamespace should be called before making a request'
      );
    }

    // reset namespace
    this.namespace = '';

    return super.handleResponse(status, headers, payload, requestData);
  }
}
