import Route from '@ember/routing/route';
import {
  inject as service
} from '@ember/service';

export default class AuthenticatedClientRoute extends Route {

  @service store;
  model(data) {
    return this.store.find('client', data.client_id);
  }
}
