import Route from '@ember/routing/route';
import {
  ScrollTopMixin
} from '../../mixins/scroll-top';

export default class AuthenticatedProjectsRoute extends ScrollTopMixin(Route) {
  model() {
    return this.get('store').findAll('Project');
  }
}
