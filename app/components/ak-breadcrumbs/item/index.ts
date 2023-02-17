import Component from '@glimmer/component';
import BreadcrumbsService from 'irene/services/breadcrumbs';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
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

  get classes() {
    return {
      linkTextClass: styles['ak-breadcrumb-item-link-text'],
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkBreadcrumbs::Item': typeof AkBreadcrumbsItemComponent;
  }
}
