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
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import type IreneAjaxService from 'irene/services/ajax';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';
import type ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';
import {
  canManageSigningCertificates,
  showsProjectSigningCertificate,
} from 'irene/utils/cyod';

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

// A cert decorated by `existingCerts` with everything a row needs to render, so
// the template does not have to compose `and`/`not`/`eq` per row.
type CertRow = CertInfo & {
  expiresOn: string;
  statusColor: 'error' | 'success';
  showsActiveBadge: boolean;
  showsActivate: boolean;
  isBusy: boolean;
  deleteDisabled: boolean;
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
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  @tracked showDrawer = false;
  @tracked activeTab: 'add' | 'existing' = 'add';
  @tracked cert: CertInfo | null = null;
  @tracked certs: CertInfo[] = [];
  @tracked busyCertId: number | null = null;
  @tracked pendingDelete: CertInfo | null = null;

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

  get canManage() {
    return canManageSigningCertificates(
      this.me.org?.is_admin,
      this.me.org?.is_owner
    );
  }

  get visible() {
    const enabled = this.organization.isCyodRegistrationEnabled;

    if (!this.args.project) {
      return enabled;
    }

    return showsProjectSigningCertificate(
      enabled,
      this.args.project.platform,
      this.canManage
    );
  }

  get hasCert() {
    return !!(this.cert && this.cert.team_id);
  }

  get hasCerts() {
    return this.certs.length > 0;
  }

  get p12FileName() {
    return this.p12File?.name ?? null;
  }

  get profileFileName() {
    return this.profileFile?.name ?? null;
  }

  // Both files and the p12 password are mandatory. The password is trimmed so
  // whitespace alone does not enable Save.
  get canSave() {
    return !!this.p12File && !!this.profileFile && !!this.password.trim();
  }

  get canActivate() {
    return !this.isProjectScope;
  }

  get isAddTab() {
    return this.activeTab === 'add';
  }

  get isExistingTab() {
    return this.activeTab === 'existing';
  }

  // Project scope holds at most one cert; org scope holds the collection.
  get scopedCerts(): CertInfo[] {
    if (!this.isProjectScope) {
      return this.certs;
    }

    return this.cert ? [this.cert] : [];
  }

  get existingCerts(): CertRow[] {
    return this.scopedCerts.map((cert) => ({
      ...cert,
      expiresOn: cert.expires_at
        ? dayjs(cert.expires_at).format('MMMM D, YYYY, hh:mm A')
        : '',
      statusColor: cert.is_expired ? 'error' : 'success',
      showsActiveBadge: Boolean(cert.is_active) || this.isProjectScope,
      showsActivate: this.canActivate && !cert.is_active && !cert.is_expired,
      isBusy: this.busyCertId === cert.id,
      // The backend refuses to delete the active cert only while siblings
      // exist — there would be no fallback to promote. A lone cert is deletable
      // even though it is always the active one, so the org can clear its setup
      // entirely.
      deleteDisabled: Boolean(cert.is_active) && this.certs.length > 1,
    }));
  }

  get hasExistingCerts() {
    return this.existingCerts.length > 0;
  }

  @action
  handleOpen() {
    this.activeTab = 'add';
    this.showDrawer = true;
    this.load.perform();
  }

  @action
  handleClose() {
    this.resetForm();
    this.pendingDelete = null;
    this.showDrawer = false;
  }

  @action
  handleTabChange(tab: 'add' | 'existing') {
    this.activeTab = tab;
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

  @action
  clearP12() {
    this.p12File = null;
  }

  @action
  clearProfile() {
    this.profileFile = null;
  }

  @action
  resetForm() {
    this.certName = '';
    this.bundleId = '';
    this.password = '';
    this.p12File = null;
    this.profileFile = null;
  }

  @action
  requestDelete(cert: CertInfo) {
    this.pendingDelete = cert;
  }

  @action
  cancelDelete() {
    this.pendingDelete = null;
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
      this.notify.error(this.intl.t('cyod.signingCert.missingFiles'));

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

      this.notify.success(this.intl.t('cyod.signingCert.uploadSuccess'));

      this.resetForm();

      await this.load.perform();
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });

  confirmDelete = task({ drop: true }, async () => {
    const cert = this.pendingDelete;

    if (!cert) {
      return;
    }

    if (this.isProjectScope) {
      await this.deleteCert.perform();
    } else {
      await this.deleteOrgCert.perform(cert);
    }

    this.pendingDelete = null;
  });

  deleteCert = task({ restartable: true }, async () => {
    try {
      await this.ajax.delete(this.baseUrl);

      this.notify.success(this.intl.t('cyod.signingCert.deleted'));

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

      this.notify.success(this.intl.t('cyod.signingCert.deleted'));

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

      this.notify.success(this.intl.t('cyod.signingCert.activated'));

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
