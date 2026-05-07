import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type { AssessmentPolicyRow } from 'irene/components/store-release-readiness/scan-results';
import type StoreReleaseReadinessFindingAdapter from 'irene/adapters/store-release-readiness-finding';
import type StoreReleaseReadinessFindingModel from 'irene/models/store-release-readiness-finding';

export interface StoreReleaseReadinessPolicyDetailsOverrideDrawerContentSignature {
  Element: HTMLDivElement;
  Args: {
    onClose: () => void;
    category: string;
    title: string | null;
    statusData: AssessmentPolicyRow;
    isOverridden: boolean;
    finding: StoreReleaseReadinessFindingModel;
    overrideComment?: string | null;
  };
}

export default class StoreReleaseReadinessPolicyDetailsOverrideDrawerContentComponent extends Component<StoreReleaseReadinessPolicyDetailsOverrideDrawerContentSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notifications: NotificationService;

  @tracked commentInput = '';

  get isSaveDisabled(): boolean {
    return (
      this.commentInput.trim().length === 0 ||
      this.saveOverrideComment.isRunning
    );
  }

  @action
  onCommentInput(event: Event): void {
    this.commentInput = (event.target as HTMLTextAreaElement).value;
  }

  saveOverrideComment = task(async () => {
    const comment = this.commentInput.trim();

    if (!comment) {
      return;
    }

    try {
      const adapter = this.store.adapterFor(
        'store-release-readiness-finding'
      ) as StoreReleaseReadinessFindingAdapter;

      await adapter.overrideFinding(this.args.finding.id, comment);

      this.notifications.success(
        this.intl.t('storeReleaseReadiness.overrideIgnoreSuccess')
      );

      this.args.onClose();
    } catch (e) {
      this.notifications.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::PolicyDetails::OverrideDrawerContent': typeof StoreReleaseReadinessPolicyDetailsOverrideDrawerContentComponent;
  }
}
