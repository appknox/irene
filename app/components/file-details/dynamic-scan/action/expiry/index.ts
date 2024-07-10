/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { EmberRunTimer } from '@ember/runloop/types';
import { addObserver, removeObserver } from '@ember/object/observers';
import type Store from '@ember-data/store';

import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';

import type FileModel from 'irene/models/file';
import type DatetimeService from 'irene/services/datetime';
import type DynamicscanModel from 'irene/models/dynamicscan';
import ENV from 'irene/config/environment';

export interface DynamicScanExpirySignature {
  Args: {
    file: FileModel;
  };
}

export default class DynamicScanExpiryComponent extends Component<DynamicScanExpirySignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @service declare datetime: DatetimeService;

  @tracked dynamicscan: DynamicscanModel | null = null;
  @tracked durationRemaining: null | Duration = null;
  @tracked clockStop = false;
  @tracked extendBtnAnchorRef: HTMLElement | null = null;

  constructor(owner: unknown, args: DynamicScanExpirySignature['Args']) {
    super(owner, args);

    this.fetchDynamicscan.perform().then(() => {
      this.clock();
    });
  }

  willDestroy() {
    super.willDestroy();

    this.clockStop = true;

    if (this.dynamicscan) {
      removeObserver(
        this.dynamicscan,
        'isReadyOrRunning',
        this.observeDeviceState
      );
    }
  }

  get extendTimeOptions() {
    return [5, 15, 30];
  }

  get profileId() {
    return this.args.file.profile.get('id');
  }

  fetchDynamicscan = task(async () => {
    if (this.profileId) {
      this.dynamicscan = await this.store.findRecord(
        'dynamicscan',
        this.profileId
      );
    }

    if (this.dynamicscan) {
      addObserver(
        this.dynamicscan,
        'isReadyOrRunning',
        this.observeDeviceState
      );
    }
  });

  observeDeviceState() {
    this.fetchDynamicscan.perform();
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

  clock(): EmberRunTimer | undefined {
    if (this.clockStop) {
      return;
    }

    if (ENV.environment === 'test') {
      this.updateDurationRemaining();
      return;
    }

    this.updateDurationRemaining();
    later(this, this.clock, 1000);
  }

  updateDurationRemaining() {
    const expiresOn = this.dynamicscan ? this.dynamicscan.timeoutOn : null;

    if (!expiresOn) {
      return;
    }

    const mExpiresOn = dayjs(expiresOn);
    const mNow = dayjs();
    const duration = this.datetime.duration(mExpiresOn.diff(mNow));

    this.durationRemaining = duration;
  }

  extendtime = task(async (time: number) => {
    const dynamicscan = this.dynamicscan;

    if (!dynamicscan) {
      return;
    }

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

  @action
  handleExtendTimeClick(event: MouseEvent) {
    this.extendBtnAnchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleExtendTimeMenuClose() {
    this.extendBtnAnchorRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Expiry': typeof DynamicScanExpiryComponent;
  }
}
