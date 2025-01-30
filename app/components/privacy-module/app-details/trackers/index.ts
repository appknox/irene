import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import type PrivacyModuleService from 'irene/services/privacy-module';
import type TrackersModel from 'irene/models/trackers';
import type { PrivacyModuleTrackersQueryParam } from 'irene/routes/authenticated/dashboard/privacy-module/app-details/index';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';

export interface PrivacyModuleAppDetailsTrackersSignature {
  Args: {
    queryParams: PrivacyModuleTrackersQueryParam;
  };
}

export default class PrivacyModuleAppDetailsTrackersComponent extends Component<PrivacyModuleAppDetailsTrackersSignature> {
  @service declare privacyModule: PrivacyModuleService;
  @service declare store: Store;
  @service declare router: RouterService;

  @tracked selectedTracker: TrackersModel | null = null;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppDetailsTrackersSignature['Args']
  ) {
    super(owner, args);

    this.privacyModule.fetchTrackerData.perform(
      this.limit,
      this.offset,
      this.fileId,
      false
    );
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get fileId() {
    return this.router?.currentRoute?.parent?.params['app_id'];
  }

  get trackerDataList() {
    return this.privacyModule.trackerDataList;
  }

  get trackerDataCount() {
    return this.privacyModule.trackerDataCount;
  }

  get isFetchingTrackers() {
    return this.privacyModule.fetchTrackerData.isRunning;
  }

  get trackerIsSelected() {
    return !!this.selectedTracker;
  }

  get fileSummaryIsExpanded() {
    return this.privacyModule.expandFileDetailsSummaryFileId !== null;
  }

  get hasNoTracker() {
    return this.trackerDataCount === 0;
  }

  get showEmptyContent() {
    return !this.isFetchingTrackers && this.hasNoTracker;
  }

  get hasCodeSignature() {
    return (this.selectedTracker?.codeSignature?.length ?? 0) > 0;
  }

  get hasNetworkSignature() {
    return (this.selectedTracker?.networkSignature?.length ?? 0) > 0;
  }

  @action handlePrevNextAction(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.privacyModule.fetchTrackerData.perform(limit, offset, this.fileId);
  }

  @action handleItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;
    const offset = 0;

    this.privacyModule.fetchTrackerData.perform(limit, offset, this.fileId);
  }

  @action openTrackerInfoDrawer(tracker: TrackersModel) {
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
