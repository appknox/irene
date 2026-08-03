import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { runTask } from 'ember-lifeline';
import { EmberRunTimer } from '@ember/runloop/types';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';

import ENV from 'irene/config/environment';
import type DatetimeService from 'irene/services/datetime';
import type DynamicscanModel from 'irene/models/dynamicscan';

export interface DynamicScanExpirySignature {
  Args: {
    dynamicscan: DynamicscanModel;
  };
}

export default class DynamicScanExpiryComponent extends Component<DynamicScanExpirySignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @service declare datetime: DatetimeService;
  @service declare intl: IntlService;

  @tracked durationRemaining: null | Duration = null;
  @tracked clockStop = false;
  @tracked extendBtnAnchorRef: HTMLElement | null = null;

  constructor(owner: unknown, args: DynamicScanExpirySignature['Args']) {
    super(owner, args);

    this.clock();
  }

  willDestroy() {
    super.willDestroy();

    this.clockStop = true;
  }

  get extendTimeOptions() {
    return [5, 15, 30];
  }

  get dynamicscan() {
    return this.args.dynamicscan;
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

    if (!duration || duration.asMilliseconds() <= 0) {
      return {
        seconds: '00',
        minutes: '00',
      };
    }

    return {
      seconds: ('0' + Math.max(0, duration.seconds())).slice(-2),
      minutes: ('0' + Math.max(0, Math.floor(duration.asMinutes()))).slice(-2),
    };
  }

  get expiryTooltip() {
    return this.dynamicscan.isAutopiloted
      ? this.intl.t('dynamicScanDeviceInteractionDisabled')
      : this.intl.t('dynamicScanTitleTooltip');
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

    runTask(this, () => this.clock(), 1000);
  }

  updateDurationRemaining() {
    const expiresOn = this.dynamicscan.autoShutdownOn;

    if (!expiresOn) {
      return;
    }

    const mExpiresOn = dayjs(expiresOn);
    const mNow = dayjs();
    const duration = this.datetime.duration(mExpiresOn.diff(mNow));

    this.durationRemaining = duration;
  }

  extendtime = task(async (time: number) => {
    this.handleExtendTimeMenuClose();

    try {
      const ds = this.dynamicscan;

      await ds.extendTime(time);
      await ds.reload();
    } catch (error) {
      const err = error as AdapterError;

      if (err.errors?.[0]?.detail) {
        this.notify.error(err.errors[0].detail);

        return;
      }

      throw err;
    }
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
