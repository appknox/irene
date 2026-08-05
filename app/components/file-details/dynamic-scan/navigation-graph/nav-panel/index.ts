import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import {
  GRAPH_LAYOUT_OPTIONS,
  type NavigationGraphLayout,
  type NavigationGraphLayoutOption,
} from '../graph-config';

import type RouterService from '@ember/routing/router-service';
import type FileModel from 'irene/models/file';

export interface NavigationGraphUserRoleOption {
  hasNavigationGraph: boolean;
  label: string;
  truncatedLabel: string;
  value: string;
  disabled: boolean;
  disabledReason: string | null;
}

// Role labels longer than this are clipped in the select trigger (the full
// label still shows in the dropdown).
const MAX_ROLE_LABEL_CHARS = 27;

function truncateRoleLabel(label: string) {
  return label.length > MAX_ROLE_LABEL_CHARS
    ? `${label.slice(0, MAX_ROLE_LABEL_CHARS)}...`
    : label;
}

export interface FileDetailsDynamicScanNavigationGraphNavPanelSignature {
  Element: HTMLElement;
  Args: {
    hasGraphData: boolean;
    variantCount: number;
    transitionCount: number;
    file: FileModel;
    dynamicscanId: string;
    onLayoutChange: (layout: NavigationGraphLayout) => void;
  };
}

export default class FileDetailsDynamicScanNavigationGraphNavPanelComponent extends Component<FileDetailsDynamicScanNavigationGraphNavPanelSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;

  layoutOptions: NavigationGraphLayoutOption[];

  @tracked selectedLayout: NavigationGraphLayout = 'grid';
  @tracked userRoleOptions: NavigationGraphUserRoleOption[] = [];

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanNavigationGraphNavPanelSignature['Args']
  ) {
    super(owner, args);

    this.layoutOptions = GRAPH_LAYOUT_OPTIONS.map((option) => ({
      value: option.value,
      label: this.intl.t(`navigationGraph.${option.value}`),
    }));

    this.loadUserRoleOptions.perform();
  }

  get file() {
    return this.args.file;
  }

  get dynamicscanId() {
    return String(this.args.dynamicscanId ?? '');
  }

  get selectedLayoutOption() {
    return this.layoutOptions.find(
      (option) => option.value === this.selectedLayout
    );
  }

  get selectedUserRoleOption() {
    return this.userRoleOptions.find(
      (option) => option.value === this.dynamicscanId
    );
  }

  get hasMultipleUserRoles() {
    return this.userRoleOptions.length > 1;
  }

  get allUserRolesHaveNoGraph() {
    return this.userRoleOptions.every(
      (option) => option.disabled && !option.hasNavigationGraph
    );
  }

  @action
  handleLayoutChange(option: NavigationGraphLayoutOption) {
    this.selectedLayout = option.value;
    this.args.onLayoutChange(option.value);
  }

  @action
  handleUserRoleChange(option: NavigationGraphUserRoleOption) {
    if (option.disabled || option.value === this.dynamicscanId) {
      return;
    }

    this.router.replaceWith(
      'authenticated.dashboard.ds-navigation-graph',
      String(this.file.id),
      option.value
    );
  }

  loadUserRoleOptions = task(async () => {
    const scans = await this.file.getFileLastAutomatedDynamicScan();
    const scansWithRole = scans.filter((scan) => scan.scenarioUserRole);
    const options: NavigationGraphUserRoleOption[] = [];

    for (const scan of scansWithRole) {
      const label = scan.scenarioUserRole?.name ?? '';

      const scanInProgress =
        scan.isReadyOrRunning || scan.isStartingOrShuttingInProgress;

      const hasNavigationGraph = scan.isNavigationGraphGenerated;
      const disabled = scanInProgress || !hasNavigationGraph;

      let disabledReason: string | null = null;

      if (scanInProgress) {
        disabledReason = this.intl.t('navigationGraph.roleScanInProgress');
      } else if (!hasNavigationGraph) {
        disabledReason = this.intl.t('navigationGraph.roleNoNavigationGraph');
      }

      options.push({
        label,
        truncatedLabel: truncateRoleLabel(label),
        value: scan.id,
        disabled,
        disabledReason,
        hasNavigationGraph,
      });
    }

    this.userRoleOptions = options;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::NavigationGraph::NavPanel': typeof FileDetailsDynamicScanNavigationGraphNavPanelComponent;
  }
}
