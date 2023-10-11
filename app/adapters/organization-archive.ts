import commondrf from './commondrf';

export default class OrganizationArchiveAdapter extends commondrf {
  _buildURL(moduleName: string, id: string) {
    const organizationService = this.organization;
    const organizationID = organizationService.selected?.id;
    const namespace = this.namespace;
    const baseurl = `${namespace}/organizations/${organizationID}/archives`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  getDownloadURL(id: string) {
    const archiveIdBaseURL = this._buildURL('organization-archive', id);
    const downloadURL = `${archiveIdBaseURL}/download_url`;
    return this.ajax(downloadURL, 'GET');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-archive': OrganizationArchiveAdapter;
  }
}
