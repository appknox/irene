import Service from '@ember/service';
import $ from 'jquery';
import { schedule } from '@ember/runloop'
const $viewport = $('html, body');

const scrollToService = Service.extend({
  duration: 700,
  padding: 0,
  afterTransition: null,

   //liquidFireTransitions: inject.service(),

   scrollTo(target, duration, padding) {
    duration = typeof duration === 'number' ? duration : this.get('duration');
    padding  = typeof padding  === 'number' ? padding  : this.get('padding');

    let scrollTop;
    if (!target) {
      scrollTop = 0;
      duration = 0;
    } else {
      let offset = $(target).offset();
      scrollTop = offset ? offset.top - padding : 0;
    }

     $viewport.animate({ scrollTop }, duration);
  },

   didTransition() {
    let token = this.get('afterTransition');
    if (token) {
      this.set('currentAnalysis', token);
      schedule('afterRender', () => {
        this.scrollTo(token.target, token.duration, token.padding);
      })
    }
  }
});
export default scrollToService
