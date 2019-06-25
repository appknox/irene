import LinkComponentMixin from '../mixins/link-component';
import RouterMixin from '../mixins/router';
import LinkComponent from '@ember/routing/link-component';
import Router from '@ember/routing/router';

 export function initialize(/* application */) {
  LinkComponent.reopen(LinkComponentMixin);
  Router.reopen(RouterMixin);
}

 export default {
  name: 'scroll-to',
  initialize: initialize
};
