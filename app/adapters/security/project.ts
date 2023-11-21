import CommonDRFAdapter from '../commondrf';

export default class SecurityProjectAdapter extends CommonDRFAdapter {
  namespace = 'api/hudson-api';

  pathForType() {
    return 'projects';
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'security/project': SecurityProjectAdapter;
  }
}
