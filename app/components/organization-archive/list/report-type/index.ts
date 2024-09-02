import Component from '@glimmer/component';
import dayjs from 'dayjs';

import type OrganizationArchiveModel from 'irene/models/organization-archive';
import { OrganizationArchiveType } from 'irene/models/organization-archive';

export interface OrganizationArchiveListReportTypeSignature {
  Args: {
    archive: OrganizationArchiveModel;
  };
}

export default class OrganizationArchiveListReportTypeComponent extends Component<OrganizationArchiveListReportTypeSignature> {
  get duration() {
    const fromDate = dayjs(this.args.archive.fromDate).format('DD MMM YYYY');
    const toDate = dayjs(this.args.archive.toDate).format('DD MMM YYYY');

    return `${fromDate} - ${toDate}`;
  }

  get isLatestScanReport() {
    return (
      this.args.archive.archiveType === OrganizationArchiveType.LATEST_SCAN
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationArchive::List::ReportType': typeof OrganizationArchiveListReportTypeComponent;
    'organization-archive/list/report-type': typeof OrganizationArchiveListReportTypeComponent;
  }
}
