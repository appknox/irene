import ENV from 'irene/config/environment';
import Route from '@ember/routing/route';

import {
  inject as service
} from '@ember/service';

export default class InviteRoute extends Route {
  @service ajax;
  async model(params) {
    const token = params.token;
    const url = [ENV.endpoints.invite, token].join('/')
    const ret = await this.get("ajax").request(url)
    return ret;
  }
}
