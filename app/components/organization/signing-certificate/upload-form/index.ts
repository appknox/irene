import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import { fileToBase64 } from 'irene/utils/file-to-base64';
import type IreneAjaxService from 'irene/services/ajax';

export interface OrganizationSigningCertificateUploadFormSignature {
  Element: HTMLFormElement;

  Args: {
    baseUrl: string;
    onUploaded: () => void;
    onCancel: () => void;
  };
}

export default class OrganizationSigningCertificateUploadFormComponent extends Component<OrganizationSigningCertificateUploadFormSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;

  @tracked certName = '';
  @tracked bundleId = '';
  @tracked password = '';
  @tracked p12File: File | null = null;
  @tracked profileFile: File | null = null;

  get p12FileName() {
    return this.p12File?.name ?? null;
  }

  get profileFileName() {
    return this.profileFile?.name ?? null;
  }

  // Both files and the p12 password are mandatory. The password is trimmed so
  // whitespace alone does not unlock save.
  get canSave() {
    return !!this.p12File && !!this.profileFile && !!this.password.trim();
  }

  resetForm() {
    this.certName = '';
    this.bundleId = '';
    this.password = '';
    this.p12File = null;
    this.profileFile = null;
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

  upload = task({ drop: true }, async (event: Event) => {
    event.preventDefault();

    if (!this.p12File || !this.profileFile) {
      this.notify.error(this.intl.t('cyod.signingCert.missingFiles'));

      return;
    }

    try {
      // The API takes the signing material base64-encoded in a JSON body, so
      // the request stays on application/json rather than multipart/form-data.
      const [p12, mobileprovision] = await Promise.all([
        fileToBase64(this.p12File),
        fileToBase64(this.profileFile),
      ]);

      await this.ajax.post(this.args.baseUrl, {
        data: {
          p12,
          mobileprovision,
          password: this.password,
          name: this.certName,
          bundle_id: this.bundleId.trim(),
        },
      });

      this.notify.success(this.intl.t('cyod.signingCert.uploadSuccess'));

      this.resetForm();
      this.args.onUploaded();
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SigningCertificate::UploadForm': typeof OrganizationSigningCertificateUploadFormComponent;
    'organization/signing-certificate/upload-form': typeof OrganizationSigningCertificateUploadFormComponent;
  }
}
