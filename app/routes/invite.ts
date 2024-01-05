import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import ENV from 'irene/config/environment';

export default class InviteRoute extends Route {
  @service declare ajax: any;

  async model(params: { token: string }) {
    const token = params.token;
    const url = [ENV.endpoints['invite'], token].join('/');

    return await this.ajax.request(url);
  }
}
