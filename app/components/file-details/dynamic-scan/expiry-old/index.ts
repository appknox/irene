import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import dayjs from 'dayjs';
import Store from '@ember-data/store';
import FileModel from 'irene/models/file';
import DatetimeService from 'irene/services/datetime';
import { Duration } from 'dayjs/plugin/duration';
import DynamicscanOldModel from 'irene/models/dynamicscan-old';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';

export interface FileDetailsDynamicScanExpiryOldSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsDynamicScanExpiryOldComponent extends Component<FileDetailsDynamicScanExpiryOldSignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @service declare datetime: DatetimeService;

  @tracked dynamicscan: DynamicscanOldModel | null = null;
  @tracked durationRemaining: null | Duration = null;
  @tracked extendBtnAnchorRef: HTMLElement | null = null;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanExpiryOldSignature['Args']
  ) {
    super(owner, args);

    this.fetchDynamicscan.perform();
  }

  get extendTimeOptions() {
    return [5, 15, 30];
  }

  get canExtend() {
    const duration = this.durationRemaining;

    if (!duration) {
      return false;
    }

    return duration.asMinutes() < 15;
  }

  get timeRemaining() {
    const duration = this.durationRemaining;

    if (!duration) {
      return {
        seconds: '00',
        minutes: '00',
      };
    }

    return {
      seconds: ('0' + duration.seconds()).slice(-2),
      minutes: ('0' + Math.floor(duration.asMinutes())).slice(-2),
    };
  }

  @action
  setScanDuration(expiresOn: Date | null) {
    if (!expiresOn) {
      this.durationRemaining = null;

      return;
    }

    const mExpiresOn = dayjs(expiresOn);
    const mNow = dayjs(Date.now());
    const duration = this.datetime.duration(mExpiresOn.diff(mNow));

    this.durationRemaining = duration;
  }

  @action
  handleExtendTimeClick(event: MouseEvent) {
    this.extendBtnAnchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleExtendTimeMenuClose() {
    this.extendBtnAnchorRef = null;
  }

  clock = task(async () => {
    while (Number(this.durationRemaining?.asSeconds()) > -1) {
      if (ENV.environment === 'test') {
        break;
      }

      const expiresOn = this.dynamicscan ? this.dynamicscan.expiresOn : null;

      this.setScanDuration(expiresOn);

      await timeout(1000);
    }
  });

  extendtime = task(async (time: number) => {
    const dynamicscan = this.dynamicscan;

    if (!dynamicscan) {
      return;
    }

    this.handleExtendTimeMenuClose();

    try {
      await dynamicscan.extendTime(time);
    } catch (error) {
      const err = error as AdapterError;

      if (err.errors && err.errors[0]?.detail) {
        this.notify.error(err.errors[0].detail);

        return;
      }

      throw err;
    }

    await this.fetchDynamicscan.perform();
  });

  fetchDynamicscan = task(async () => {
    try {
      const id = this.args.file.id;
      const dynamicscan = await this.store.findRecord('dynamicscan-old', id);
      const expiresOn = dynamicscan ? dynamicscan.expiresOn : null;

      // Necessary to ensure correct time is updated in store cache before clock is started
      // If not reloaded, timer starts with cached timer before store updates record with new details
      await dynamicscan?.reload();

      this.dynamicscan = dynamicscan;

      this.setScanDuration(expiresOn);
      this.clock.perform();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::ExpiryOld': typeof FileDetailsDynamicScanExpiryOldComponent;
  }
}
