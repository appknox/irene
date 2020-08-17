import Component from '@ember/component'
import { computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { task } from 'ember-concurrency';
import moment from 'moment';


export default Component.extend({
  notify: service('notifications'),
  store: service('store'),
  file: null,
  dynamicscan: null,
  durationRemaining: null,
  clockStop: false,

  didInsertElement() {
    this._super(...arguments);
    this.clock();
    this.get('fetchDynaminscan').perform();
  },
  willDestroyElement() {
    this._super(...arguments);
    this.set('clockStop', true);
  },
  fetchDynaminscan: task(function* () {
    const id = this.get('file.id');
    const dynamicscan = yield this.get('store').find('dynamicscan', id);
    this.set('dynamicscan', dynamicscan);
    return dynamicscan;
  }),
  dynamicscanObserver: observer('file.isReady',  function() {
    this.get('fetchDynaminscan').perform();
  }),
  canExtend: computed('durationRemaining', function() {
    const duration = this.get('durationRemaining');
    if(!duration) {
      return false;
    }
    return duration.asMinutes() < 15;
  }),
  timeRemaining: computed('durationRemaining', function() {
    const duration = this.get('durationRemaining')
    if(!duration) {
      return {
        seconds: "00",
        minutes: "00"
      };
    }
    return {
      seconds: ("0" + duration.seconds()).slice(-2),
      minutes: ("0" + Math.floor(duration.asMinutes())).slice(-2),
    }
  }),
  clock () {
    if(this.get('clockStop')) {
      return;
    }
    const expiresOn = this.get('dynamicscan.expiresOn');
    if(!expiresOn){
      return later(this, this.clock, 1000);
    }
    const mExpiresOn =  moment(expiresOn);
    const mNow = moment();
    const duration = moment.duration(mExpiresOn.diff(mNow));
    this.set('durationRemaining', duration);
    later(this, this.clock, 1000);
  },
  extendtime: task(function* (time, close) {
    const dynamicscan = this.get('dynamicscan');
    if(!dynamicscan) {
      return;
    }
    try {
      yield dynamicscan.extendTime(time);
    } catch(error) {
      if(error.errors && error.errors[0].detail) {
        this.get('notify').error(error.errors[0].detail);
        return
      }
      throw error
    }
    yield this.get('fetchDynaminscan').perform();
    close();
  })
});
