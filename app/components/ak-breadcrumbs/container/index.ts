import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

interface AkBreadcrumbsContainerArgs {
  id?: string;
}

export interface AkBreadcrumbsContainerSignature {
  Element: HTMLElement;
  Args: AkBreadcrumbsContainerArgs;
  Blocks: {
    default: [];
  };
}

export default class AkBreadcrumbsContainerComponent extends Component<AkBreadcrumbsContainerSignature> {
  get id() {
    return this.args.id || `ak-breadcrumb-container-${guidFor(this)}`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkBreadcrumbs::Container': typeof AkBreadcrumbsContainerComponent;
  }
}
