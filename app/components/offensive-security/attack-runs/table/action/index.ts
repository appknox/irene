import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface OffensiveSecurityAttackRunsTableActionSignature {
  Args: {
    scan: OffsecScanModel;
  };
}

export default class OffensiveSecurityAttackRunsTableActionComponent extends Component<OffensiveSecurityAttackRunsTableActionSignature> {
  @service declare router: RouterService;

  @tracked anchorRef: HTMLElement | null = null;

  /**
   * The row itself navigates on click, so the trigger must stop the event here or
   * opening the menu would also transition away from the list.
   */
  @action
  handleOpenMenu(event: MouseEvent): void {
    event.stopPropagation();

    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleCloseMenu(): void {
    this.anchorRef = null;
  }

  @action
  handleViewResults(): void {
    this.handleCloseMenu();

    this.router.transitionTo(
      'authenticated.dashboard.offensive-security.scan',
      this.args.scan.id
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::Action': typeof OffensiveSecurityAttackRunsTableActionComponent;
    'offensive-security/attack-runs/table/action': typeof OffensiveSecurityAttackRunsTableActionComponent;
  }
}
