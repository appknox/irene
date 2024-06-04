import Component from '@glimmer/component';
import { AkBreadcrumbsItemSignature } from 'irene/components/ak-breadcrumbs/item';

export default class SecurityFileSearchListHeaderComponent extends Component {
  get breadcrumbItems(): AkBreadcrumbsItemSignature['Args'][] {
    return [
      {
        route: 'authenticated.security.projects',
        linkTitle: 'Projects',
      },
      {
        route: 'authenticated.security.files',
        linkTitle: 'List of Files',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileSearchList::Header': typeof SecurityFileSearchListHeaderComponent;
  }
}
