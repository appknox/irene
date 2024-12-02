import Component from '@glimmer/component';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

import type AkBreadcrumbsService from 'irene/services/ak-breadcrumbs';
import styles from './index.scss';

export interface AkBreadcrumbsTrailSignature {
  Element: HTMLElement;
  Args: {
    id?: string;
    separator?: string;
  };
  Blocks: {
    default: [];
    separator: [];
  };
}

export default class AkBreadcrumbsAutoTrailComponent extends Component<AkBreadcrumbsTrailSignature> {
  @service('ak-breadcrumbs') declare breadcrumbsService: AkBreadcrumbsService;

  get id() {
    return this.args.id || `ak-breadcrumb-item-${guidFor(this)}`;
  }

  get classes() {
    return {
      linkTextClass: styles['ak-breadcrumb-auto-trail-item-link-text'],
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkBreadcrumbs::AutoTrail': typeof AkBreadcrumbsAutoTrailComponent;
  }
}
