import CommonDRFAdapter from './commondrf';

export default class OffsecUploadAppUrlAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace}/organizations/${this.organization?.selected?.id}/offsec/upload_app_url`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'offsec-upload-app-url': OffsecUploadAppUrlAdapter;
  }
}
