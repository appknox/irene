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

  @tracked expandedNodes: string[] = [];
  @tracked treeNodes: AkTreeNodeProps[] = [];
  @tracked parentVerificationStatus = false;

  constructor(
    owner: unknown,
    args: SbomComponentDetailsOverviewSignature['Args']
  ) {
    super(owner, args);

    if (this.parentId && this.parentId !== '0') {
      this.redirectIfVerificationFailed.perform();
    }
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

  get componentDetailsList() {
    return [
      {
        name: this.intl.t('sbomModule.componentType'),
        value: this.args.sbomComponent?.type,
      },
      {
        name: this.intl.t('version'),
        value: this.args.sbomComponent?.version,
      },
      {
        name: this.intl.t('sbomModule.latestVersion'),
        value: this.args.sbomComponent?.latestVersion,
      },
      {
        name: this.intl.t('status'),
        component: 'sbom/component-status' as const,
      },
      {
        name: this.intl.t('author'),
        value: this.args.sbomComponent?.author,
      },
    ];
  }

  get columns() {
    return [
      {
        name: this.intl.t('sbomModule.componentDetails'),
        valuePath: 'name',
        width: 40,
      },
      {
        name: '',
        valuePath: 'value',
      },
    ];
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

    if (parentId === '0' || !parentId) {
      return undefined;
    }

    return parentId;
  }

  get isNotOutdated() {
    return !this.sbomFile?.get('isOutdated');
  }

  verifyParentId = task(async () => {
    try {
      if (!this.args.queryParams.sbom_component_id || !this.parentId) {
        this.parentVerificationStatus = false;
        return;
      }

      const parents = await this.loadParents.perform(this.componentId);

      this.parentVerificationStatus = parents.some(
        (parent) => parent.id.toString() === this.parentId
      );
    } catch (error) {
      this.parentVerificationStatus = false;
    }
  });

  redirectIfVerificationFailed = task(async () => {
    await this.verifyParentId.perform();

    if (this.parentVerificationStatus === false) {
      const sbProjectId = this.sbomProject?.get('id') || '';
      const sbFileId = this.sbomFile?.get('id') || '';

      this.router.transitionTo(
        'authenticated.dashboard.sbom.component-details',
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
