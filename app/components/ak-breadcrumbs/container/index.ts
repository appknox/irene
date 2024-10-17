import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import BreadcrumbsService, {
  type BreadCrumbsContainer,
} from 'irene/services/breadcrumbs';

interface AkBreadcrumbsContainerArgs {
  id?: string;
  isModifiable?: boolean;
}

export interface AkBreadcrumbsContainerSignature {
  Element: HTMLElement;
  Args: AkBreadcrumbsContainerArgs;
  Blocks: {
    default: [];
  };
}

export default class AkBreadcrumbsContainerComponent extends Component<AkBreadcrumbsContainerSignature> {
  @service('breadcrumbs') declare breadcrumbsService: BreadcrumbsService;

  container: BreadCrumbsContainer | null = null;

  get id() {
    return this.args.id || `ak-breadcrumb-container-${guidFor(this)}`;
  }

  @action registerContainer(element: HTMLUListElement) {
    if (this.args.isModifiable) {
      const container = {
        element,
        id: this.id,
      };

      this.container = container;
      this.breadcrumbsService.registerContainer(container);
    }
  }

  willDestroy(): void {
    super.willDestroy();

    if (this.container) {
      this.breadcrumbsService.unregisterContainer();
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkBreadcrumbs::Container': typeof AkBreadcrumbsContainerComponent;
  }
}
