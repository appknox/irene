import { inject as service } from '@ember/service';
import RESTAdapter from '@ember-data/adapter/rest';
import Store from '@ember-data/store';
import OrganizationService from 'irene/services/organization';

export default class CommonDRFAdapter extends RESTAdapter {
  host: string;
  namespace: string;
  namespace_v2: string;
  namespace_v3: string;
  addTrailingSlashes: boolean;

  @service declare organization: OrganizationService;
  @service declare store: Store;

  buildURLFromBase(resource_url: string): string;
}
