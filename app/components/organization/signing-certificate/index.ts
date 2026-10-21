import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
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

export type CertScope = 'project' | 'org';

export type CertRow = {
  cert: OrganizationSigningCertificateModel;
  scope: CertScope;
  showsActiveBadge: boolean;
  showsActivate: boolean;
  showsDelete: boolean;
  isBusy: boolean;
  deleteDisabled: boolean;
};

type PendingDelete = {
  cert: OrganizationSigningCertificateModel;
  scope: CertScope;
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
  @tracked pendingDelete: PendingDelete | null = null;
  @tracked isConfirmingOverride = false;
  @tracked certFetchFailed = false;

  get uploadUrl() {
    return this.args.project
      ? this.projectCertAdapter.urlForUpload(this.args.project.id)
      : this.orgCertAdapter.urlForUpload();
  }

  get isProjectScope() {
    return !!this.args.project;
  }

  // Treat a still-loading or failed fetch as "there might be an existing
  // cert" rather than "there is none" -- otherwise a save that races ahead of
  // fetchCertificates would silently overwrite a project cert it never saw.
  get hasExistingProjectCert() {
    return this.isProjectScope && (!!this.cert || this.certFetchFailed);
  }

  get isLoadingExistingCert() {
    return this.isProjectScope && this.fetchCertificates.isRunning;
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

  get isAddTab() {
    return this.activeTab === 'add';
  }

  get isExistingTab() {
    return this.activeTab === 'existing';
  }

  // A project cert can be switched off and back on in place (its own
  // `is_active`), rather than only ever being deleted -- that is how a
  // project defers back to the org's cert without losing its own upload.
  get projectCertRows(): CertRow[] {
    if (!this.cert) {
      return [];
    }

    return [
      {
        cert: this.cert,
        scope: 'project',
        showsActiveBadge: this.cert.isActive,
        showsActivate: !this.cert.isActive,
        showsDelete: true,
        isBusy: this.busyCertId === this.cert.id,
        deleteDisabled: false,
      },
    ];
  }

  // A project with its own active cert overrides the org's, so its row's
  // active badge is hidden and its action becomes reverting to the org cert
  // instead of the org-wide activate used at org scope.
  get orgCertRows(): CertRow[] {
    const overriddenByProjectCert =
      this.isProjectScope && !!this.cert?.isActive;

    return this.certs.map((cert) => ({
      cert,
      scope: 'org',
      showsActiveBadge: cert.isActive && !overriddenByProjectCert,
      showsActivate: this.isProjectScope
        ? overriddenByProjectCert
        : !cert.isActive && !cert.isExpired,
      showsDelete: !this.isProjectScope,
      isBusy: this.busyCertId === cert.id,
      deleteDisabled: cert.isActive && this.certs.length > 1,
    }));
  }

  get existingCerts(): CertRow[] {
    return [...this.projectCertRows, ...this.orgCertRows];
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
  openExistingTab() {
    this.activeTab = 'existing';
    this.showDrawer = true;

    this.fetchCertificates.perform();
  }

  @action
  handleClose() {
    this.pendingDelete = null;
    this.isConfirmingOverride = false;
    this.showDrawer = false;
  }

  @action
  handleTabChange(tab: 'add' | 'existing') {
    this.activeTab = tab;
  }

  @action
  requestDelete(cert: OrganizationSigningCertificateModel, scope: CertScope) {
    this.pendingDelete = { cert, scope };
  }

  @action
  cancelDelete() {
    this.pendingDelete = null;
  }

  @action
  requestOverrideConfirm() {
    this.isConfirmingOverride = true;
  }

  @action
  cancelOverrideConfirm() {
    this.isConfirmingOverride = false;
  }

  // The drawer header's back button serves whichever confirmation is pending
  // -- deleting a certificate or overriding the project's existing one.
  @action
  handleConfirmationBack() {
    if (this.pendingDelete) {
      this.cancelDelete();
    } else {
      this.cancelOverrideConfirm();
    }
  }

  // Dispatches a click on a row's activate action to the right place: the
  // project's own toggle, deferring to the org cert by switching the project's
  // own cert off, or the org-wide activate used when managing the org's full
  // collection at org scope.
  @action
  handleActivate(cert: OrganizationSigningCertificateModel, scope: CertScope) {
    this.busyCertId = cert.id;

    if (scope === 'project') {
      this.setProjectCertActive.perform(true);
    } else if (this.isProjectScope) {
      this.setProjectCertActive.perform(false);
    } else {
      this.activateCert.perform(cert);
    }
  }

  // Project scope returns the project's own cert alongside the org's whole
  // collection in one call, so this goes through a raw ajax request (like
  // `activate()` below) rather than `store.queryRecord`, which only knows how
  // to normalize a single record shape.
  fetchCertificates = task(async () => {
    this.certFetchFailed = false;

    try {
      if (this.args.project) {
        const { projectCertificate, organizationCertificates } =
          await waitForPromise(
            this.projectCertAdapter.fetchWithOrgCerts(this.args.project.id)
          );

        this.cert = projectCertificate;
        this.certs = organizationCertificates;
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
      this.certFetchFailed = true;

      this.logger.error('[CYOD] Could not load signing certificates:', e);
    }
  });

  confirmDelete = task({ drop: true }, async () => {
    const pending = this.pendingDelete;

    if (!pending) {
      return;
    }

    if (pending.scope === 'project') {
      await this.deleteCert.perform();
    } else {
      await this.deleteOrgCert.perform(pending.cert);
    }

    this.pendingDelete = null;
  });

  // Toggles the project's own cert in place, without deleting or re-uploading
  // it, so switching back is a single click rather than a fresh upload.
  setProjectCertActive = task({ drop: true }, async (active: boolean) => {
    const projectId = this.args.project?.id;

    if (!projectId) {
      return;
    }

    try {
      this.cert = await waitForPromise(
        this.projectCertAdapter.setActive(projectId, active)
      );

      this.notify.success(
        this.intl.t(
          active ? 'cyod.signingCert.activated' : 'cyod.signingCert.deactivated'
        )
      );

      await this.fetchCertificates.perform();

      this.busyCertId = null;
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });

  deleteCert = task({ drop: true }, async () => {
    const projectId = this.args.project?.id;

    if (!projectId) {
      return;
    }

    try {
      await waitForPromise(this.projectCertAdapter.remove(projectId));
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
        await waitForPromise(cert.activate());
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
