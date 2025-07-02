import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import type SbomComponentModel from 'irene/models/sbom-component';
import type { AkTreeNodeProps } from '../../scan-details';

interface SbomComponentDetailsQueryParams {
  sbom_project_id: string;
  sbom_file_id: string;
  sbom_component_id: string;
  sbom_component_parent_id: string;
}

interface ParentLabel {
  id: string;
  label: string;
  route: string;
}

export interface SbomComponentDetailsOverviewSignature {
  Args: {
    sbomComponent: SbomComponentModel;
    queryParams: SbomComponentDetailsQueryParams;
  };
  Blocks: {
    default: [];
  };
}

export default class SbomComponentDetailsOverviewComponent extends Component<SbomComponentDetailsOverviewSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked expandedNodes: string[] = [];
  @tracked treeNodes: AkTreeNodeProps[] = [];
  @tracked parentVerificationStatus = false;
  @tracked parentLabels: ParentLabel[] = [];

  constructor(
    owner: unknown,
    args: SbomComponentDetailsOverviewSignature['Args']
  ) {
    super(owner, args);

    this.redirectIfVerificationFailed.perform();
  }

  get sbomComponent() {
    return this.args.sbomComponent;
  }

  get sbomFile() {
    return this.sbomComponent.get('sbFile');
  }

  get sbomProject() {
    return this.sbomFile?.get('sbProject');
  }

  get project() {
    return this.sbomProject?.get('project');
  }

  get packageName() {
    return this.project?.get('packageName');
  }

  get componentId() {
    return this.args.queryParams.sbom_component_id;
  }

  get showDependencyTree() {
    if (this.sbomComponent.isMLModel) {
      return false;
    }

    return this.isNotOutdated;
  }

  @action
  updateExpandedNodes(nodes: string[]) {
    this.expandedNodes = nodes;
  }

  @action
  updateTreeNodes(nodes: AkTreeNodeProps[]) {
    this.treeNodes = nodes;
  }

  get parentId() {
    const parentId = this.args.queryParams.sbom_component_parent_id;

    return parentId;
  }

  get isNotOutdated() {
    return !this.sbomFile?.get('isOutdated');
  }

  get showMultipleParents() {
    return this.parentLabels.length > 1;
  }

  get effectiveParentId() {
    if (!this.sbomComponent.isDependency) {
      return undefined;
    }

    if (this.parentId === '0') {
      return this.parentLabels.length > 0
        ? this.parentLabels[0]?.id
        : undefined;
    }

    return this.parentId;
  }

  get remainingParentLabels() {
    // If component is not a dependency, show all parents
    if (!this.sbomComponent.isDependency) {
      return this.parentLabels;
    }

    if (this.parentId === '0' && this.parentLabels.length > 0) {
      // Skip the first parent since it's being used as the main parent
      return this.parentLabels.slice(1);
    }

    // Otherwise filter out the current parent
    return this.parentLabels.filter((parent) => parent.id !== this.parentId);
  }

  @action
  getLabel(item: SbomComponentModel) {
    const bomRefParts = item.bomRef.split(':').filter(Boolean);
    const ecosystem = bomRefParts[0] || 'generic';
    const group = bomRefParts.length === 3 ? bomRefParts[1] : '';
    const groupPrefix = group ? `${group}/` : '';
    const versionSuffix = item.version ? `@${item.version}` : '';
    const purl = `pkg:${ecosystem}/${groupPrefix}${item.name}${versionSuffix}`;

    return purl;
  }

  verifyParentId = task(async () => {
    try {
      if (!this.args.queryParams.sbom_component_id || !this.parentId) {
        this.parentVerificationStatus = false;
        return;
      }

      const parents = await this.loadParents.perform(this.componentId);

      this.parentLabels = parents.map((parent) => ({
        id: parent.id,
        label: this.getLabel(parent),
        route: 'authenticated.dashboard.sbom.component-details.overview',
      }));

      // If parentId is '0' consider it verified
      if (this.parentId === '0') {
        this.parentVerificationStatus = true;
      } else {
        this.parentVerificationStatus = parents.some(
          (parent) => parent.id.toString() === this.parentId
        );
      }
    } catch (error) {
      this.parentVerificationStatus = false;
      this.parentLabels = [];
    }
  });

  redirectIfVerificationFailed = task(async () => {
    await this.verifyParentId.perform();

    if (this.parentVerificationStatus === false) {
      const sbProjectId = this.sbomProject?.get('id') || '';
      const sbFileId = this.sbomFile?.get('id') || '';

      this.notify.error(this.intl.t('sbomModule.parentComponentNotFound'));

      this.router.transitionTo(
        'authenticated.dashboard.sbom.component-details.overview',
        sbProjectId,
        sbFileId,
        this.componentId,
        '0'
      );
    } else {
      return;
    }
  });

  loadParents = task(async (componentId: string) => {
    const queryParams = {
      type: 2,
      sbomFileId: this.sbomFile?.get('id'),
      componentId,
    };

    const response = await this.store.query('sbom-component', queryParams);

    return response.slice();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Overview': typeof SbomComponentDetailsOverviewComponent;
  }
}
