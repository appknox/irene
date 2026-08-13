import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import parseError from 'irene/utils/parse-error';
import type OffsecFindingModel from 'irene/models/offsec-finding';

export type FindingDetailTab = 'finding' | 'exploitation';

export interface OffensiveSecurityFindingDetailSignature {
  Args: {
    scanId: string;
    findingId: string;
  };
}

export default class OffensiveSecurityFindingDetailComponent extends Component<OffensiveSecurityFindingDetailSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked finding: OffsecFindingModel | null = null;
  @tracked activeTab: FindingDetailTab = 'finding';

  constructor(
    owner: unknown,
    args: OffensiveSecurityFindingDetailSignature['Args']
  ) {
    super(owner, args);

    this.loadFinding.perform(args.findingId);
  }

  get isLoading(): boolean {
    return this.loadFinding.isRunning;
  }

  get isFindingTab(): boolean {
    return this.activeTab === 'finding';
  }

  get evidence() {
    return this.finding?.evidenceList ?? [];
  }

  /** Labels the technique block honestly — attempted is not the same as used. */
  get techniqueLabel(): string {
    if (!this.finding) {
      return '';
    }

    if (this.finding.isResisted) {
      return this.intl.t('offensiveSecurity.techniqueAttempted');
    }

    if (!this.finding.wasAttempted) {
      return this.intl.t('offensiveSecurity.techniqueStaged');
    }

    return this.intl.t('offensiveSecurity.techniqueUsed');
  }

  @action
  setTab(tab: FindingDetailTab): void {
    this.activeTab = tab;
  }

  @action
  goBackToScan(): void {
    this.router.transitionTo(
      'authenticated.dashboard.offensive-security.scan',
      this.args.scanId
    );
  }

  loadFinding = task({ drop: true }, async (findingId: string) => {
    try {
      this.finding = (await this.store.findRecord('offsec-finding', findingId, {
        reload: true,
      })) as OffsecFindingModel;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

      this.goBackToScan();
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::FindingDetail': typeof OffensiveSecurityFindingDetailComponent;
    'offensive-security/finding-detail': typeof OffensiveSecurityFindingDetailComponent;
  }
}
