import { inject as service } from '@ember/service';
import RESTAdapter from '@ember-data/adapter/rest';
import Store from '@ember-data/store';

export default class CommonDRFAdapter extends RESTAdapter {
  host: string;
  namespace: string;
  namespace_v2: string;
  addTrailingSlashes: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare organization: any;
  @service declare store: Store;

  buildURLFromBase(resource_url: string): string;
}
