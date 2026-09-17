import commondrf from './commondrf';
import type OrganizationSigningCertificateModel from 'irene/models/organization-signing-certificate';

export default class OrganizationSigningCertificateAdapter extends commondrf {
  get baseurl() {
    return `${this.namespace}/organizations/${this.organization.selected?.id}/signing-certificates`;
  }

  _buildURL(_modelName?: string, id?: string | number) {
    if (id) {
      return this.buildURLFromBase(
        `${this.baseurl}/${encodeURIComponent(id)}/`
      );
    }

    return this.buildURLFromBase(`${this.baseurl}/`);
  }

  urlForQuery() {
    return this._buildURL();
  }

  urlForUpload() {
    return this._buildURL();
  }

  urlForDeleteRecord(id: string | number) {
    return this._buildURL('organization-signing-certificate', id);
  }

  urlForActivate(id: string | number) {
    const baseURL = this._buildURL('organization-signing-certificate', id);

    return `${baseURL}activate/`;
  }

  // ── Custom endpoints ──────────────────────────────────────────────────────
  async activate(cert: OrganizationSigningCertificateModel) {
    const url = this.urlForActivate(cert.id);
    const response = await this.ajax(url, 'POST', { data: {} });

    const normalized = this.store.normalize(
      'organization-signing-certificate',
      response
    );

    return this.store.push(normalized) as OrganizationSigningCertificateModel;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-signing-certificate': OrganizationSigningCertificateAdapter;
  }
}
