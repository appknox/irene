import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type { Snapshot } from '@ember-data/store';

import { toValidatedFindingPayload } from 'irene/utils/knoxiq-validated-findings';
import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';

export default class SecurityValidatedFindingSerializer extends DRFSerializer {
  /**
   * The API reads nested and writes flat, so the payload is rebuilt from the
   * record's attributes rather than serialized attribute by attribute.
   */
  serialize(snapshot: Snapshot) {
    const record = snapshot.record as SecurityValidatedFindingModel;

    return toValidatedFindingPayload(record.content);
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'security/validated-finding': SecurityValidatedFindingSerializer;
  }
}
