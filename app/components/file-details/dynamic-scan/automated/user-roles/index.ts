import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import {
  DsStatusGroup,
  getDsStatusGroupForScan,
} from 'irene/utils/ds-status-group';

import type DynamicscanModel from 'irene/models/dynamicscan';
import type ScenarioUserRoleModel from 'irene/models/scenario-user-role';

interface UserRoleInfo {
  role: ScenarioUserRoleModel;
  status: DsStatusGroup;
  isSelected: boolean;
  isInLoadingStatus: boolean;
  nonLoadingStatusIconInfo: {
    icon: 'check-circle' | 'error' | 'info';
    color: 'success' | 'error' | 'info';
  };
}

export interface FileDetailsDynamicScanAutomatedUserRolesSignature {
  Element: HTMLElement;
  Args: {
    lastAutomatedDynamicScans: DynamicscanModel[];
    selectedScan: DynamicscanModel | null;
    onRoleChange: (dynamicscan: DynamicscanModel) => void;
  };
}

export default class FileDetailsDynamicScanAutomatedUserRolesComponent extends Component<FileDetailsDynamicScanAutomatedUserRolesSignature> {
  @tracked selectedUserRole: ScenarioUserRoleModel | null = null;

  LOADING_STATUS_GROUPS = [
    DsStatusGroup.IN_QUEUE,
    DsStatusGroup.STARTING,
    DsStatusGroup.RUNNING,
    DsStatusGroup.STOPPING,
    DsStatusGroup.RETRYING,
  ];

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanAutomatedUserRolesSignature['Args']
  ) {
    super(owner, args);

    this.selectedUserRole = args.selectedScan?.scenarioUserRole ?? null;
  }

  get lastAutoDScans() {
    return this.args.lastAutomatedDynamicScans;
  }

  get userRoles() {
    return this.lastAutoDScans
      .map((ds) => {
        const role = ds.scenarioUserRole;
        const status = getDsStatusGroupForScan(ds.status);

        return role ? { role, status } : null;
      })
      .filter(Boolean) as UserRoleInfo[];
  }

  @action
  getDsForUserRole(userRole: ScenarioUserRoleModel) {
    return this.lastAutoDScans.find(
      (ds) => ds.scenarioUserRole?.id === userRole.id
    );
  }

  @action
  isLoadingStatus(status: DsStatusGroup) {
    return this.LOADING_STATUS_GROUPS.includes(status);
  }

  @action
  computedNonLoadingStatusIconInfo(status: DsStatusGroup) {
    switch (status) {
      case DsStatusGroup.COMPLETED:
        return {
          icon: 'check-circle' as const,
          color: 'success' as const,
        };

      case DsStatusGroup.ERRORED:
        return {
          icon: 'error' as const,
          color: 'error' as const,
        };

      case DsStatusGroup.CANCELLED:
        return { icon: 'block' as const, color: 'textSecondary' as const };

      default:
        return {
          icon: 'info' as const,
          color: 'info' as const,
        };
    }
  }

  @action
  toggleRoleSelection({ role }: UserRoleInfo) {
    // Don't do anything if the role is already selected
    if (this.selectedUserRole?.id === role.id) {
      return;
    }

    this.selectedUserRole = role;
    this.args.onRoleChange(this.getDsForUserRole(role) as DynamicscanModel);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Automated::UserRoles': typeof FileDetailsDynamicScanAutomatedUserRolesComponent;
  }
}
