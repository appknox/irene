/* eslint-disable ember/no-mixins, prettier/prettier */
import Route from '@ember/routing/route';
import {
  ScrollTopMixin
} from '../../mixins/scroll-top';

export default class AuthenticatedProjectsRoute extends ScrollTopMixin(Route) {

}
