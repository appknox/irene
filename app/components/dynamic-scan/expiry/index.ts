/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { task } from 'ember-concurrency';
import dayjs from 'dayjs';
import { addObserver, removeObserver } from '@ember/object/observers';
import Store from '@ember-data/store';
import FileModel from 'irene/models/file';
import DatetimeService from 'irene/services/datetime';
import { Duration } from 'dayjs/plugin/duration';
import { EmberRunTimer } from '@ember/runloop/types';
import DynamicscanModal from 'irene/models/dynamicscan';
import ENV from 'irene/config/environment';

export interface DyanmicScanExpirySignature {
  Args: {
    file: FileModel;
  };
}

export default class DyanmicScanExpiryComponent extends Component<DyanmicScanExpirySignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @service declare datetime: DatetimeService;

  @tracked dynamicscan: DynamicscanModal | null = null;
  @tracked durationRemaining: null | Duration = null;
  @tracked clockStop = false;
  @tracked extendBtnAnchorRef: HTMLElement | null = null;

  constructor(owner: unknown, args: DyanmicScanExpirySignature['Args']) {
    super(owner, args);

    this.fetchDynaminscan.perform();

    this.clock();

    addObserver(this.args.file, 'isReady', this.observeDeviceState);
  }

  willDestroy() {
    super.willDestroy();

    this.clockStop = true;

    removeObserver(this.args.file, 'isReady', this.observeDeviceState);
  }

  get extendTimeOptions() {
    return [5, 15, 30];
  }

  fetchDynaminscan = task(async () => {
    const id = this.args.file.id;
    this.dynamicscan = await this.store.findRecord('dynamicscan', id);
  });

  observeDeviceState() {
    this.fetchDynaminscan.perform();
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
    if (this.clockStop || ENV.environment === 'test') {
      return;
    }

    const expiresOn = this.dynamicscan ? this.dynamicscan.expiresOn : null;

    if (!expiresOn) {
      return later(this, this.clock, 1000);
    }

    const mExpiresOn = dayjs(expiresOn);
    const mNow = dayjs();
    const duration = this.datetime.duration(mExpiresOn.diff(mNow));

    this.durationRemaining = duration;

    later(this, this.clock, 1000);
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

    await this.fetchDynaminscan.perform();
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
