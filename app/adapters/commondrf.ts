import { service } from '@ember/service';
import { DRFAuthenticationBase } from 'irene/adapters/auth-base';
import ENV from 'irene/config/environment';
import type OrganizationService from 'irene/services/organization';

export default class CommonDRFAdapter extends DRFAuthenticationBase {
  host = ENV.host;
  namespace = ENV.namespace;
  namespace_v2 = ENV.namespace_v2;
  namespace_v3 = ENV.namespace_v3;
  addTrailingSlashes = false;

  @service declare organization: OrganizationService;

  buildURLFromBase(resource_url: string) {
    const hostURLstr = this.host;

    try {
      const hostURL = new URL(hostURLstr);

      return new URL(resource_url, hostURL).href;
    } catch (e) {
      if (hostURLstr === '/' || hostURLstr === '') {
        if (resource_url[0] !== '/') {
          return '/' + resource_url;
        }

        return resource_url;
      }

      throw e;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    commondrf: typeof CommonDRFAdapter;
  }
}
