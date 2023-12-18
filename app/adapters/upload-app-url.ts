import CommonDRFAdapter from './commondrf';

export default class UploadAppUrlAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace}/organizations/${this.organization?.selected?.id}/upload_app_url`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'upload-app-url': UploadAppUrlAdapter;
  }
}
