import Component from '@glimmer/component';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

import type OrganizationArchiveModel from 'irene/models/organization-archive';

export interface OrganizationArchiveListStatusSignature {
  Args: {
    archive: OrganizationArchiveModel;
  };
}

dayjs.extend(relativeTime);

export default class OrganizationArchiveListStatusComponent extends Component<OrganizationArchiveListStatusSignature> {
  get availableUntil() {
    return dayjs(this.args.archive.availableUntil).fromNow();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationArchive::List::Status': typeof OrganizationArchiveListStatusComponent;
    'organization-archive/list/status': typeof OrganizationArchiveListStatusComponent;
  }
}
