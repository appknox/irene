import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Store from 'ember-data/store';
import type { AssessmentPolicyRow } from 'irene/components/store-release-readiness/scan-results';
import type StoreReleaseReadinessFindingAdapter from 'irene/adapters/store-release-readiness-finding';
import type StoreReleaseReadinessFindingModel from 'irene/models/store-release-readiness-finding';

import './index.scss';

export interface StoreReleaseReadinessPolicyDetailsOverrideDrawerContentSignature {
  Element: HTMLDivElement;
  Args: {
    onClose: () => void;
    category: string;
    title: string;
    statusData: AssessmentPolicyRow;
    isOverridden: boolean;
    finding: StoreReleaseReadinessFindingModel;
    overrideComment?: string | null;
  };
}

export default class StoreReleaseReadinessPolicyDetailsOverrideDrawerContentComponent extends Component<StoreReleaseReadinessPolicyDetailsOverrideDrawerContentSignature> {
  @service declare store: Store;
  @service('notifications') declare notifications: NotificationService;
  @tracked commentInput = '';
  @tracked isSaving = false;

  get isSaveDisabled(): boolean {
    return this.commentInput.trim().length === 0 || this.isSaving;
  }

  @action
  onCommentInput(event: Event): void {
    this.commentInput = (event.target as HTMLTextAreaElement).value;
  }

  @action
  async saveOverrideComment(): Promise<void> {
    const comment = this.commentInput.trim();
    if (!comment) {
      return;
    }

    this.isSaving = true;

    try {
      const adapter = this.store.adapterFor(
        'store-release-readiness-finding'
      ) as StoreReleaseReadinessFindingAdapter;

      await adapter.overrideFinding(this.args.finding.id, comment);

      this.args.finding.setProperties({
        passed: true,
        isOverridden: true,
        overrideComment: comment,
      });

      this.notifications.success('Successfully Ignored');
      this.args.onClose();
    } finally {
      this.isSaving = false;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::PolicyDetails::OverrideDrawerContent': typeof StoreReleaseReadinessPolicyDetailsOverrideDrawerContentComponent;
  }
}
