import commondrf from '../commondrf';

export default class SecurityManualScanDetailAdapter extends commondrf {
  _buildURL(_modelName: string | number, id: string | number) {
    return this.buildURLFromBase(
      `${this.hudson_namespace}/files/${id}/manual_scan_details`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'security/manual-scan-detail': SecurityManualScanDetailAdapter;
  }
}
