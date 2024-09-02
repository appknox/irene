import Component from '@glimmer/component';

import type OrganizationArchiveModel from 'irene/models/organization-archive';

export interface OrganizationArchiveListGeneratedBySignature {
  Args: {
    archive: OrganizationArchiveModel;
  };
}

export default class OrganizationArchiveListGeneratedByComponent extends Component<OrganizationArchiveListGeneratedBySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationArchive::List::GeneratedBy': typeof OrganizationArchiveListGeneratedByComponent;
    'organization-archive/list/generated-by': typeof OrganizationArchiveListGeneratedByComponent;
  }
}
