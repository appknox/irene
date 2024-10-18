import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

import type BreadcrumbsService from 'irene/services/breadcrumbs';
import styles from './index.scss';

interface AkBreadcrumbsItemSignatureArgs {
  id?: string;
  replace?: boolean;
  separator?: string;
  linkTitle?: string;
  disabled?: boolean;
  route?: string;
  model?: string;
  models?: string[];
  query?: Record<string, unknown>;
  isAppendable?: boolean;
}

export interface AkBreadcrumbsItemSignature {
  Element: HTMLElement;
  Args: AkBreadcrumbsItemSignatureArgs;
  Blocks: {
    default: [];
    separator: [];
  };
}

export default class AkBreadcrumbsItemComponent extends Component<AkBreadcrumbsItemSignature> {
  @service('breadcrumbs') declare breadcrumbsService: BreadcrumbsService;

  get id() {
    return this.args.id || `ak-breadcrumb-item-${guidFor(this)}`;
  }

  get breadcrumbsContainerElement() {
    return this.breadcrumbsService.container?.element as HTMLUListElement;
  }

  get classes() {
    return {
      linkTextClass: styles['ak-breadcrumb-item-link-text'],
    };
  }

  @action initializeBreadcrumbsItem(element: HTMLLIElement) {
    const replace = this.args.replace;

    if (replace) {
      this.breadcrumbsService.replacePreviousItem({
        element,
        id: this.id,
        replace,
      });
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkBreadcrumbs::Item': typeof AkBreadcrumbsItemComponent;
  }
}
