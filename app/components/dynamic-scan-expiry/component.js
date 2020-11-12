import Component from '@glimmer/component';
import {
  computed,
  set
} from '@ember/object';
import {
  tracked
} from '@glimmer/tracking';
import {
  inject as service
} from '@ember/service';
import {
  later
} from '@ember/runloop';
import {
  task
} from 'ember-concurrency';
import dayjs from 'dayjs';
import {
  addObserver,
  removeObserver
} from '@ember/object/observers';


export default class DyanmicScanExpiryComponent extends Component {
  @service('notify') notification;

  @service store;

  @service datetime;

  @tracked file = null;
  @tracked dynamicscan = null;

  @tracked durationRemaining = null;

  @tracked clockStop = false;

  constructor() {
    super(...arguments);
    this.fetchDynaminscan.perform();
    this.clock();
    addObserver(this.args.file, 'isReady', this.observeDeviceState);
  }

  willDestroy() {
    this.clockStop = true;
    removeObserver(this.args.file, 'isReady', this.observeDeviceState);
  }

  @task(function* () {
    const id = this.args.file.id;
    const dynamicscan = yield this.store.find('dynamicscan', id);
    set(this, 'dynamicscan', dynamicscan);
    return dynamicscan;
  })
  fetchDynaminscan;

  observeDeviceState() {
    this.fetchDynaminscan.perform();
  }

  @computed('durationRemaining')
  get canExtend() {
    const duration = this.durationRemaining;
    if (!duration) {
      return false;
    }
    return duration.asMinutes() < 15;
  }

  @computed('durationRemaining')
  get timeRemaining() {
    const duration = this.durationRemaining;
    if (!duration) {
      return {
        seconds: "00",
        minutes: "00"
      };
    }
    return {
      seconds: ("0" + duration.seconds()).slice(-2),
      minutes: ("0" + Math.floor(duration.asMinutes())).slice(-2),
    }
  }


  clock() {
    if (this.clockStop) {
      return;
    }
    const expiresOn = this.dynamicscan ? this.dynamicscan.expiresOn : null;
    if (!expiresOn) {
      return later(this, this.clock, 1000);
    }
    const mExpiresOn = dayjs(expiresOn);
    const mNow = dayjs();
    const duration = this.datetime.duration(mExpiresOn.diff(mNow));
    set(this, 'durationRemaining', duration);
    later(this, this.clock, 1000);
  }


  @task(function* (time, close) {
    const dynamicscan = this.dynamicscan;
    if (!dynamicscan) {
      return;
    }
    try {
      yield dynamicscan.extendTime(time);
    } catch (error) {
      if (error.errors && error.errors[0].detail) {
        this.notify.error(error.errors[0].detail);
        return
      }
      throw error
    }
    yield this.fetchDynaminscan.perform();
    close();
  })
  extendtime;
}
