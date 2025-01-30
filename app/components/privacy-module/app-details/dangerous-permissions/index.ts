import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { faker } from '@faker-js/faker';
import { tracked } from 'tracked-built-ins';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface DangerPermDataProps {
  id: number;
  name: string;
  description: string;
}

export default class PrivacyModuleAppDetailsTrackersComponent extends Component {
  @service declare privacyModule: PrivacyModuleService;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked selectedTracker: DangerPermDataProps | null = null;

  get isFetchingDangerPerms() {
    return false;
  }

  get trackerIsSelected() {
    return !!this.selectedTracker;
  }

  get fileSummaryIsExpanded() {
    return this.privacyModule.expandFileDetailsSummaryFileId !== null;
  }

  get dangerousPermissions() {
    return Array.from({ length: 9 }, (_, idx) => ({
      id: idx,
      name: faker.word.words().toUpperCase().split(' ').join('_'),
      description: faker.lorem.sentences(1),
    })) as DangerPermDataProps[];
  }

  @action goToPage(args: PaginationProviderActionsArgs) {
    console.log(args);
  }

  willDestroy(): void {
    super.willDestroy();

    this.privacyModule.expandFileDetailsSummaryFileId = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::DangerousPermissions': typeof PrivacyModuleAppDetailsTrackersComponent;
  }
}
