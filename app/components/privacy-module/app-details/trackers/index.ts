import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { faker } from '@faker-js/faker';
import { tracked } from 'tracked-built-ins';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface TrackerDataProps {
  id: number;
  name: string;
  tags: string[];
  code_signature: string;
  network_signature: string;
}

export default class PrivacyModuleAppDetailsTrackersComponent extends Component {
  @service declare privacyModule: PrivacyModuleService;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked selectedTracker: TrackerDataProps | null = null;

  get isFetchingTrackers() {
    return false;
  }

  get trackerIsSelected() {
    return !!this.selectedTracker;
  }

  get fileSummaryIsExpanded() {
    return this.privacyModule.expandFileDetailsSummaryFileId !== null;
  }

  get trackersTableData() {
    return Array.from({ length: 25 }, (_, idx) => ({
      id: idx,
      name: faker.company.name(),
      tags: Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () =>
        faker.word.sample({ length: { min: 5, max: 15 } })
      ),
      code_signature: faker.internet.domainName(),
      network_signature: faker.internet.domainName(),
    })) as TrackerDataProps[];
  }

  @action goToPage(args: PaginationProviderActionsArgs) {
    console.log(args);
  }

  @action openTrackerInfoDrawer(tracker: TrackerDataProps) {
    this.selectedTracker = tracker;
  }

  @action closeTrackerInfoDrawer() {
    this.selectedTracker = null;
  }

  willDestroy(): void {
    super.willDestroy();

    this.privacyModule.expandFileDetailsSummaryFileId = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Trackers': typeof PrivacyModuleAppDetailsTrackersComponent;
  }
}
