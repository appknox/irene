/**
 * iOS Signing Certificate (CYOD dynamic scanning)
 *
 * Upload / view / delete the customer iOS signing identity (.p12 + provisioning
 * profile) used to re-sign an app for dynamic scanning. The secret material is
 * never returned by the API — only parsed metadata (team id, App ID, expiry,
 * enrolled UDIDs).
 *
 * Scope differs:
 *  - Organization scope: a **collection** of certs. Exactly one is marked
 *    `is_active` (the signing fallback). A scan first auto-matches the app's
 *    bundle id to a cert's App ID, else uses the active cert. The active cert
 *    cannot be deleted while others exist.
 *  - Project scope (`@project`): a single cert that overrides the org certs for
 *    that project's iOS scans.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';

type CertInfo = {
  id?: number;
  name?: string;
  bundle_id?: string;
  app_id?: string;
  is_active?: boolean;
  team_id?: string;
  provisions_all_devices?: boolean;
  provisioned_udids?: string[];
  expires_at?: string | null;
  is_expired?: boolean;
};

export interface OrganizationSigningCertificateSignature {
  Element: HTMLDivElement;
  Args: {
    // When set, the cert is project-scoped (overrides the org cert for this
    // project's iOS scans). When absent, it is organization-scoped.
    project?: ProjectModel;
  };
}

export default class OrganizationSigningCertificateComponent extends Component<OrganizationSigningCertificateSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked showModal = false;
  // Project scope: single cert. Org scope: a list of certs.
  @tracked cert: CertInfo | null = null;
  @tracked certs: CertInfo[] = [];

  // Id of the cert with an in-flight activate/delete, so only its row shows a
  // spinner (org scope has many rows sharing one task).
  @tracked busyCertId: number | null = null;

  @tracked certName = '';
  @tracked bundleId = '';
  @tracked password = '';
  @tracked p12File: File | null = null;
  @tracked profileFile: File | null = null;

  get baseUrl() {
    const orgId = this.organization.selected?.id;

    if (this.args.project) {
      return `/api/organizations/${orgId}/projects/${this.args.project.id}/signing-certificate/`;
    }

    return `/api/organizations/${orgId}/signing-certificates/`;
  }

  get isProjectScope() {
    return !!this.args.project;
  }

  // iOS signing certs only apply to iOS scans — hide the project-scoped UI for
  // non-iOS projects. Org scope is always shown (gated to owners by the parent).
  get visible() {
    return (
      !this.args.project || this.args.project.platform === ENUMS.PLATFORM.IOS
    );
  }

  get hasCert() {
    return !!(this.cert && this.cert.team_id);
  }

  get hasCerts() {
    return this.certs.length > 0;
  }

  // Chip color for a certificate's validity badge.
  certStatusColor = (cert: CertInfo) => (cert.is_expired ? 'error' : 'success');

  // Selected file names, surfaced next to the file-picker buttons so the user
  // can confirm their choice before uploading.
  get p12FileName() {
    return this.p12File?.name ?? null;
  }

  get profileFileName() {
    return this.profileFile?.name ?? null;
  }

  @action
  handleOpen() {
    this.showModal = true;
    this.load.perform();
  }

  @action
  handleClose() {
    this.resetForm();
    this.showModal = false;
  }

  @action
  setName(event: Event) {
    this.certName = (event.target as HTMLInputElement).value;
  }

  @action
  setBundleId(event: Event) {
    this.bundleId = (event.target as HTMLInputElement).value;
  }

  @action
  setPassword(event: Event) {
    this.password = (event.target as HTMLInputElement).value;
  }

  @action
  setP12(event: Event) {
    this.p12File = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  @action
  setProfile(event: Event) {
    this.profileFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  resetForm() {
    this.certName = '';
    this.bundleId = '';
    this.password = '';
    this.p12File = null;
    this.profileFile = null;
  }

  load = task(async () => {
    const orgId = this.organization.selected?.id;

    if (!orgId) {
      this.cert = null;
      this.certs = [];
      return;
    }

    try {
      if (this.isProjectScope) {
        const res = await this.ajax.request<CertInfo>(this.baseUrl);
        this.cert = res && (res.team_id || res.id) ? res : null;
      } else {
        const res = await this.ajax.request<CertInfo[]>(this.baseUrl);
        this.certs = Array.isArray(res) ? res : [];
      }
    } catch (e) {
      this.cert = null;
      this.certs = [];
    }
  });

  upload = task({ restartable: true }, async (event: Event) => {
    event.preventDefault();

    if (!this.p12File || !this.profileFile) {
      this.notify.error(this.intl.t('orgSigningCertMissingFiles'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('p12', this.p12File);
      formData.append('password', this.password);
      formData.append('mobileprovision', this.profileFile);
      formData.append('name', this.certName);
      formData.append('bundle_id', this.bundleId.trim());

      await this.ajax.post(this.baseUrl, { data: formData, contentType: null });

      this.notify.success(this.intl.t('orgSigningCertUploadSuccess'));
      this.resetForm();
      await this.load.perform();
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });

  // Project scope only: delete the single project cert.
  deleteCert = task({ restartable: true }, async () => {
    try {
      await this.ajax.delete(this.baseUrl);
      this.notify.success(this.intl.t('orgSigningCertDeleted'));
      this.cert = null;
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });

  // Org scope: delete one cert by id. The backend returns 409 for the active
  // cert while siblings exist — surfaced as an error toast.
  deleteOrgCert = task({ restartable: true }, async (cert: CertInfo) => {
    this.busyCertId = cert.id ?? null;
    try {
      await this.ajax.delete(`${this.baseUrl}${cert.id}/`);
      this.notify.success(this.intl.t('orgSigningCertDeleted'));
      await this.load.perform();
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    } finally {
      this.busyCertId = null;
    }
  });

  // Org scope: mark one cert active (the backend clears the previous active).
  activateCert = task({ restartable: true }, async (cert: CertInfo) => {
    this.busyCertId = cert.id ?? null;
    try {
      await this.ajax.post(`${this.baseUrl}${cert.id}/activate/`, {});
      this.notify.success(this.intl.t('orgSigningCertActivated'));
      await this.load.perform();
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    } finally {
      this.busyCertId = null;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SigningCertificate': typeof OrganizationSigningCertificateComponent;
    'organization/signing-certificate': typeof OrganizationSigningCertificateComponent;
  }
}
