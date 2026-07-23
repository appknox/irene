import commondrf from './commondrf';

export default class OrganizationArchiveAdapter extends commondrf {
  _buildURL(moduleName: string, id?: string) {
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

  async generateLatestScanArchive(fromDate?: Date, toDate?: Date) {
    const archiveBaseURL = this._buildURL('organization-archive');
    const url = `${archiveBaseURL}/generate_excel_project_latest_scans`;

    const data: Record<string, string> = {};

    if (fromDate) {
      data['from_date'] = fromDate.toISOString();
    }

    if (toDate) {
      data['to_date'] = toDate.toISOString();
    }

    return this.ajax(url, 'POST', { data });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-archive': OrganizationArchiveAdapter;
  }
}
