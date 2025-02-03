import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import SbomComponentModel from 'irene/models/sbom-component';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { AkTreeNodeProps } from '../../scan-details';

interface SbomComponentDetailsQueryParams {
  sbom_project_id: string;
  sbom_file_id: string;
  sbom_component_id: string;
  sbom_component_parent_id: string;
}

export interface SbomComponentDetailsOverviewSignature {
  Args: {
    sbomComponent: SbomComponentModel | null;
    queryParams: SbomComponentDetailsQueryParams;
  };
  Blocks: {
    default: [];
  };
}

export default class SbomComponentDetailsOverviewComponent extends Component<SbomComponentDetailsOverviewSignature> {
  @service declare intl: IntlService;

  @tracked expandedNodes: string[] = [];
  @tracked treeNodes: AkTreeNodeProps[] = [];

  get sbomFile() {
    return this.args.sbomComponent?.sbFile;
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

  get componentName() {
    return `${this.args.sbomComponent?.bomRef}  :  ${this.args.sbomComponent?.name}`;
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
        name: 'Component Details',
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

    if (parentId === '0') {
      return undefined;
    }

    return parentId;
  }

  get componentId() {
    return this.args.queryParams.sbom_component_id;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Overview': typeof SbomComponentDetailsOverviewComponent;
  }
}
