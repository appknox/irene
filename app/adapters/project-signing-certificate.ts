import commondrf from './commondrf';
import type ProjectSigningCertificateModel from 'irene/models/project-signing-certificate';
import type OrganizationSigningCertificateModel from 'irene/models/organization-signing-certificate';

interface ProjectCertificateResponse {
  project_certificate: Record<string, unknown> | null;
  organization_certificates: Record<string, unknown>[];
}

export interface ProjectWithOrgCertificates {
  projectCertificate: ProjectSigningCertificateModel | null;
  organizationCertificates: OrganizationSigningCertificateModel[];
}

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

  // The endpoint returns the project's own certificate alongside the org's
  // active one in a single call, which does not fit store.queryRecord's
  // single-record normalization -- normalize and push each half here instead.
  async fetchWithOrgCerts(
    projectId: string | number
  ): Promise<ProjectWithOrgCertificates> {
    const response = (await this.ajax(
      this.urlForQueryRecord({ projectId }),
      'GET'
    )) as ProjectCertificateResponse;

    const projectCertificate = response.project_certificate
      ? (this.store.push(
          this.store.normalize(
            'project-signing-certificate',
            response.project_certificate
          )
        ) as ProjectSigningCertificateModel)
      : null;

    const organizationCertificates = response.organization_certificates.map(
      (raw) =>
        this.store.push(
          this.store.normalize('organization-signing-certificate', raw)
        ) as OrganizationSigningCertificateModel
    );

    return { projectCertificate, organizationCertificates };
  }

  async setActive(projectId: string | number, isActive: boolean) {
    const response = await this.ajax(
      this.urlForQueryRecord({ projectId }),
      'PATCH',
      { data: { is_active: isActive } }
    );

    return this.store.push(
      this.store.normalize('project-signing-certificate', response)
    ) as ProjectSigningCertificateModel;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'project-signing-certificate': ProjectSigningCertificateAdapter;
  }
}
