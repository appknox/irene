import Component from '@glimmer/component';
import dayjs from 'dayjs';

import type OrganizationArchiveModel from 'irene/models/organization-archive';

export interface OrganizationArchiveListCreatedOnSignature {
  Args: {
    archive: OrganizationArchiveModel;
  };
}

export default class OrganizationArchiveListCreatedOnComponent extends Component<OrganizationArchiveListCreatedOnSignature> {
  get createdOn() {
    return dayjs(this.args.archive.createdOn).format('DD MMM YYYY');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationArchive::List::CreatedOn': typeof OrganizationArchiveListCreatedOnComponent;
    'organization-archive/list/created-on': typeof OrganizationArchiveListCreatedOnComponent;
  }
}
