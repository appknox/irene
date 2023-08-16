import Component from '@glimmer/component';
import OrganizationNamespaceModel from 'irene/models/organization-namespace';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

export interface OrganizationNamespaceRequestStatusSignature {
  Args: {
    namespace: OrganizationNamespaceModel;
  };
  Element: HTMLElement;
}

export default class OrganizationNamespaceComponent extends Component<OrganizationNamespaceRequestStatusSignature> {
  get createdOnDate() {
    dayjs.extend(relativeTime);
    return dayjs(this.args.namespace.createdOn).fromNow();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationNamespace::RequestStatus': typeof OrganizationNamespaceComponent;
  }
}
