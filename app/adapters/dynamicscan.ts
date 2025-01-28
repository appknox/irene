import { service } from '@ember/service';
import commondrf from './commondrf';

import type DynamicScanService from 'irene/services/dynamic-scan';
import type DynamicscanModel from 'irene/models/dynamicscan';

export default class DynamicscanAdapter extends commondrf {
  @service('dynamic-scan') declare dsService: DynamicScanService;

  namespace = this.namespace_v2;

  handleResponse(
    status: number,
    headers: object,
    payload: object,
    requestData: object
  ) {
    const response = super.handleResponse(
      status,
      headers,
      payload,
      requestData
    ) as { id: string; file: string; mode: number };

    if (response.id && response.file) {
      this.dsService.checkScanInProgressAndUpdate.perform(
        response.id,
        response.file,
        response.mode
      );
    }

    return response;
  }

  extendTime(modelName: string, snapshot: DynamicscanModel, time: number) {
    const id = snapshot.id;
    const url = `${this.buildURL(modelName, id)}/extend`;

    return this.ajax(url, 'PUT', {
      data: { time },
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    dynamicscan: DynamicscanAdapter;
  }
}
