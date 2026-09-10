import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import {
  canManageSigningCertificates,
  showsProjectSigningCertificate,
} from 'irene/utils/cyod';

import parseError from 'irene/utils/parse-error';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';
import type LoggerService from 'irene/services/logger';
import type ProjectModel from 'irene/models/project';
import type OrganizationSigningCertificateModel from 'irene/models/organization-signing-certificate';
import type ProjectSigningCertificateModel from 'irene/models/project-signing-certificate';

export type CertRow = {
  cert: OrganizationSigningCertificateModel;
  showsActiveBadge: boolean;
  showsActivate: boolean;
  isBusy: boolean;
  deleteDisabled: boolean;
};

export interface OrganizationSigningCertificateSignature {
  Element: HTMLElement;
  Args: { project?: ProjectModel | null };
}

export default class OrganizationSigningCertificateComponent extends Component<OrganizationSigningCertificateSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare me: MeService;
  @service declare logger: LoggerService;
  @service('notifications') declare notify: NotificationService;

  @tracked showDrawer = false;
  @tracked activeTab: 'add' | 'existing' = 'add';
  @tracked cert: ProjectSigningCertificateModel | null = null;
  @tracked certs: OrganizationSigningCertificateModel[] = [];
  @tracked busyCertId: string | null = null;
  @tracked pendingDelete: OrganizationSigningCertificateModel | null = null;

  get uploadUrl() {
    return this.args.project
      ? this.projectCertAdapter.urlForUpload(this.args.project.id)
      : this.orgCertAdapter.urlForUpload();
  }

  get isProjectScope() {
    return !!this.args.project;
  }

  get hasManageRole() {
    return canManageSigningCertificates(
      this.me.org?.is_admin,
      this.me.org?.is_owner
    );
  }

  get canConfigureCertificates() {
    const enabled = this.organization.isCyodRegistrationEnabled;

    if (!this.args.project) {
      return enabled;
    }

    return showsProjectSigningCertificate(
      enabled,
      this.args.project.platform,
      this.hasManageRole
    );
  }

  get hasCerts() {
    return this.certs.length > 0;
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

  get scopedCerts() {
    if (!this.isProjectScope) {
      return this.certs;
    }

    return this.cert ? [this.cert] : [];
  }

  get existingCerts(): CertRow[] {
    return this.scopedCerts.map((cert) => ({
      cert,
      showsActiveBadge: cert.isActive || this.isProjectScope,
      showsActivate: this.canActivate && !cert.isActive && !cert.isExpired,
      isBusy: this.busyCertId === cert.id,
      deleteDisabled: cert.isActive && this.certs.length > 1,
    }));
  }

  get hasExistingCerts() {
    return this.existingCerts.length > 0;
  }

  get orgCertAdapter() {
    return this.store.adapterFor('organization-signing-certificate');
  }

  get projectCertAdapter() {
    return this.store.adapterFor('project-signing-certificate');
  }

  @action
  handleOpen() {
    this.activeTab = 'add';
    this.showDrawer = true;

    this.fetchCertificates.perform();
  }

  @action
  handleClose() {
    this.pendingDelete = null;
    this.showDrawer = false;
  }

  @action
  handleTabChange(tab: 'add' | 'existing') {
    this.activeTab = tab;
  }

  @action
  requestDelete(cert: OrganizationSigningCertificateModel) {
    this.pendingDelete = cert;
  }

  @action
  cancelDelete() {
    this.pendingDelete = null;
  }

  fetchCertificates = task(async () => {
    try {
      if (this.args.project) {
        this.cert = await this.store.queryRecord(
          'project-signing-certificate',
          { projectId: this.args.project.id }
        );
      } else {
        const certs = await this.store.query(
          'organization-signing-certificate',
          {}
        );

        this.certs = certs.slice();
      }
    } catch (e) {
      this.cert = null;
      this.certs = [];

      this.logger.error('[CYOD] Could not load signing certificates:', e);
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

  deleteCert = task({ drop: true }, async () => {
    const projectId = this.args.project?.id;

    if (!projectId) {
      return;
    }

    try {
      await this.projectCertAdapter.remove(projectId);
      this.notify.success(this.intl.t('cyod.signingCert.deleted'));

      this.cert = null;
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });

  // Org scope: delete one cert by id. The backend returns 409 for the active
  // cert while siblings exist — surfaced as an error toast.
  deleteOrgCert = task(
    { drop: true },
    async (cert: OrganizationSigningCertificateModel) => {
      this.busyCertId = cert.id;

      try {
        await cert.destroyRecord();

        this.notify.success(this.intl.t('cyod.signingCert.deleted'));
        await this.fetchCertificates.perform();

        this.busyCertId = null;
      } catch (err) {
        this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
      }
    }
  );

  // Org scope: mark one cert active. Activation is exclusive, so the list is
  // reloaded to pick up the cert that lost the flag as well.
  activateCert = task(
    { drop: true },
    async (cert: OrganizationSigningCertificateModel) => {
      this.busyCertId = cert.id;

      try {
        await cert.activate();
        this.notify.success(this.intl.t('cyod.signingCert.activated'));
        await this.fetchCertificates.perform();

        this.busyCertId = null;
      } catch (err) {
        this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SigningCertificate': typeof OrganizationSigningCertificateComponent;
    'organization/signing-certificate': typeof OrganizationSigningCertificateComponent;
  }
}
