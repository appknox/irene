import { on } from '@ember/object/evented'
import Mixin from '@ember/object/mixin'
import { inject as service } from '@ember/service';

 // TODO: remove this mixin, once the routing service ladnds
const RouterMixin = Mixin.create({
  scrollTo: service('scroll-to'),

  notifyScrollToAfterTransition: on('didTransition', function() {
    this.get('scrollTo').didTransition();
  })
});
export default RouterMixin;
