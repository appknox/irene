import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type Store from 'ember-data/store';

import type PrivacyModuleService from 'irene/services/privacy-module';
import type TrackersModel from 'irene/models/trackers';
import type { PrivacyModuleTrackersQueryParam } from 'irene/routes/authenticated/dashboard/privacy-module/app-details/index';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type FileModel from 'irene/models/file';

export interface PrivacyModuleAppDetailsTrackersSignature {
  Args: {
    queryParams: PrivacyModuleTrackersQueryParam;
    file: FileModel;
  };
}

export default class PrivacyModuleAppDetailsTrackersComponent extends Component<PrivacyModuleAppDetailsTrackersSignature> {
  @service declare privacyModule: PrivacyModuleService;
  @service declare store: Store;

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
    return this.args.file.id;
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

  get resultDependencies() {
    return [this.limit, this.offset];
  }

  @action handleResultDependenciesChange() {
    this.privacyModule.fetchTrackerData.perform(
      this.limit,
      this.offset,
      this.fileId,
      false
    );
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Trackers': typeof PrivacyModuleAppDetailsTrackersComponent;
  }
}
