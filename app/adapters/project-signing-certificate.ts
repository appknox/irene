import commondrf from './commondrf';

// The project scope has a singular endpoint: one certificate, with no id in the
// path for either read or delete.
export default class ProjectSigningCertificateAdapter extends commondrf {
  _buildURL(_modelName?: string, projectId?: string | number) {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${
        this.organization.selected?.id
      }/projects/${encodeURIComponent(String(projectId))}/signing-certificate/`
    );
  }

  urlForQueryRecord(query: { projectId: string | number }) {
    return this._buildURL('project-signing-certificate', query.projectId);
  }

  urlForUpload(projectId: string | number) {
    return this._buildURL('project-signing-certificate', projectId);
  }

  urlForRemove(projectId: string | number) {
    return this._buildURL('project-signing-certificate', projectId);
  }

  remove(projectId: string | number) {
    return this.ajax(this.urlForRemove(projectId), 'DELETE');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'project-signing-certificate': ProjectSigningCertificateAdapter;
  }
}
