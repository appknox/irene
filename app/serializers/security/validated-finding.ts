import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type { Snapshot } from '@ember-data/store';

import { toValidatedFindingPayload } from 'irene/utils/knoxiq-validated-findings';
import type { SecurityValidatedFindingAdapterOptions } from 'irene/adapters/security/validated-finding';
import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';

export default class SecurityValidatedFindingSerializer extends DRFSerializer {
  /**
   * The API reads nested and writes flat, so the payload is rebuilt from the
   * record's attributes rather than serialized attribute by attribute.
   */
  serialize(snapshot: Snapshot) {
    const record = snapshot.record as SecurityValidatedFindingModel;
    const payload = toValidatedFindingPayload(record.content);

    const { isValid } = (snapshot.adapterOptions ??
      {}) as SecurityValidatedFindingAdapterOptions;

    // Only a create carries the class. An update that sent it would be
    // ignored by the API, which does not reclassify an existing finding.
    return record.get('isNew') && isValid !== undefined
      ? { ...payload, is_valid: isValid }
      : payload;
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'security/validated-finding': SecurityValidatedFindingSerializer;
  }
}
