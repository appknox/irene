import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type OffsecNewAssessmentService from 'irene/services/offsec-new-assessment';
import type { NewAssessmentSummaryItemState } from './item';

export interface OffensiveSecurityNewAssessmentSummarySignature {
  Args: {
    isUploading: boolean;
    uploadProgress: number;
    uploadingFileName?: string;
    isIosBuild: boolean;
    formattedFileSize: string;
    isStartingAssessment: boolean;
    isBeginDisabled: boolean;
    beginLabel: string;
    onBegin: () => void;
  };
}

export default class OffensiveSecurityNewAssessmentSummaryComponent extends Component<OffensiveSecurityNewAssessmentSummarySignature> {
  @service declare intl: IntlService;
  @service declare offsecNewAssessment: OffsecNewAssessmentService;

  get hasUploadedApp(): boolean {
    return Boolean(
      this.offsecNewAssessment.uploadedFile &&
        this.offsecNewAssessment.uploadItem
    );
  }

  get completeCredentials() {
    return this.offsecNewAssessment.credentials.filter(
      (c) => Boolean(c.username?.trim()) && Boolean(c.password?.trim())
    );
  }

  get buildState(): NewAssessmentSummaryItemState {
    if (this.hasUploadedApp) {
      return 'done';
    }

    return this.args.isUploading ? 'active' : 'locked';
  }

  get buildValue(): string {
    if (this.hasUploadedApp) {
      return this.offsecNewAssessment.uploadedFile?.name ?? '';
    }

    if (this.args.isUploading) {
      return this.args.uploadingFileName ?? '';
    }

    return this.intl.t('offensiveSecurity.noBuildYet');
  }

  get buildSub(): string {
    if (this.hasUploadedApp) {
      return this.intl.t('offensiveSecurity.uploadedBuildMeta', {
        size: this.args.formattedFileSize,
        platform: this.intl.t(this.args.isIosBuild ? 'ios' : 'android'),
      });
    }

    if (this.args.isUploading) {
      return this.intl.t('offensiveSecurity.uploadedPercent', {
        percent: this.args.uploadProgress,
      });
    }

    return this.intl.t('offensiveSecurity.uploadBuildHint');
  }

  get typeState(): NewAssessmentSummaryItemState {
    return this.hasUploadedApp ? 'done' : 'locked';
  }

  get isComprehensive(): boolean {
    return this.offsecNewAssessment.assessmentType === 'comprehensive';
  }

  get typeValue(): string {
    return this.intl.t(
      this.isComprehensive
        ? 'offensiveSecurity.comprehensiveTitle'
        : 'offensiveSecurity.resilienceTitle'
    );
  }

  get typeSub(): string {
    if (!this.hasUploadedApp) {
      return this.intl.t('offensiveSecurity.availableAfterUpload');
    }

    return this.intl.t(
      this.isComprehensive
        ? 'offensiveSecurity.comprehensiveNote'
        : 'offensiveSecurity.resilienceNote'
    );
  }

  get credentialsState(): NewAssessmentSummaryItemState {
    if (!this.hasUploadedApp) {
      return 'locked';
    }

    return this.completeCredentials.length > 0 ? 'done' : 'optional';
  }

  get credentialsValue(): string {
    const count = this.completeCredentials.length;

    return count > 0
      ? this.intl.t('offensiveSecurity.credentialsAdded', { count })
      : this.intl.t('offensiveSecurity.noneAdded');
  }

  get credentialsSub(): string {
    if (!this.hasUploadedApp) {
      return this.intl.t('offensiveSecurity.availableAfterUpload');
    }

    const roles = this.completeCredentials
      .map((c) => c.role.trim() || c.username.trim())
      .join(', ');

    return roles || this.intl.t('offensiveSecurity.addCredentialHint');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::NewAssessment::Summary': typeof OffensiveSecurityNewAssessmentSummaryComponent;
  }
}
