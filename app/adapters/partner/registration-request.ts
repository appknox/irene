// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { ModelSchema } from 'ember-data';
import Store from 'ember-data/store';
import { Snapshot } from '@ember-data/store';

import CommonDRFAdapter from 'irene/adapters/commondrf';
import { type PartnerRegistrationRequestModelName } from 'irene/models/partner/registration-request';

type regRequestBody = {
  email?: string;
  data?: {
    company: string;
    first_name: string;
    last_name: string;
  };
};

export default class RegistrationRequestAdapter extends CommonDRFAdapter {
  _buildURL(modelName: string | number, id: string | number) {
    const baseurl = this.buildURLFromBase(
      `${this.namespace_v2}/partners/${this.organization.selected?.id}/registration_requests`
    );

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  async patch(
    id: string | number,
    modelName: string,
    data: { approval_status: string }
  ) {
    const url = this.buildURL(modelName, id);
    await this.ajax(url, 'PATCH', { data });

    return this.store.findRecord(modelName, id);
  }

  async resend(id: string | number, modelName: string) {
    const url = `${this.buildURL(modelName, id)}/resend`;

    return await this.ajax(url, 'POST', {});
  }

  createRecord(
    store: Store,
    modelClass: { modelName: string | number },
    snapshot: Snapshot
  ) {
    const modelName =
      modelClass.modelName as PartnerRegistrationRequestModelName;

    const url = this.buildURL(modelName, null, snapshot, 'createRecord');

    // ref https://github.com/emberjs/data/blob/c421bb41e727de30de717f01b3c24c7cdcef0b8a/packages/adapter/addon/-private/utils/serialize-into-hash.js#L2
    const serializer = store.serializerFor(modelName);
    const body: regRequestBody = {};

    serializer.serializeIntoHash(
      body,
      modelClass as ModelSchema<PartnerRegistrationRequestModelName>,
      snapshot
    );

    return this.ajax(url, 'POST', {
      data: {
        email: body.email,
        company: body.data?.company,
        first_name: body.data?.first_name,
        last_name: body.data?.last_name,
      },
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/registration-request': RegistrationRequestAdapter;
  }
}
