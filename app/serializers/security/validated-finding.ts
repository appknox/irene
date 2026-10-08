/* eslint-disable ember/use-ember-data-rfc-395-imports */
import DRFSerializer from 'ember-django-adapter/serializers/drf';

import {
  buildStepId,
  fromKnoxiqFindingResponse,
  toKnoxiqFindingPayload,
} from 'irene/utils/manual-validated-findings';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';
import type { Snapshot } from '@ember-data/store';
import type Model from '@ember-data/model';

export default class SecurityValidatedFindingSerializer extends DRFSerializer {
  // The detail routes are keyed on the database id, so finding_id travels as
  // an ordinary attribute even though it also identifies the finding.
  primaryKey = 'id';

  /**
   * Steps are stamped with a client-only id as they arrive, so the editor list
   * has a key that survives a reorder. Minting them on read instead would hand
   * out fresh ids on every access and remount the step editors.
   */
  normalize(modelClass: Model, resourceHash: Record<string, unknown>) {
    const remediation = resourceHash['remediation'] as
      | { steps?: unknown[] }
      | undefined;

    const poc = resourceHash['poc'] as
      | { verification_steps?: Record<string, unknown>[] }
      | undefined;

    if (Array.isArray(remediation?.steps)) {
      remediation.steps = remediation.steps.map((step) =>
        typeof step === 'string'
          ? step
          : { ...(step as Record<string, unknown>), id: buildStepId() }
      );
    }

    if (Array.isArray(poc?.verification_steps)) {
      poc.verification_steps = poc.verification_steps.map((step) => ({
        ...step,
        id: buildStepId(),
      }));
    }

    return super.normalize(modelClass, resourceHash);
  }

  /**
   * The API reads nested and writes flat, so the payload is rebuilt from the
   * record's attributes rather than serialized attribute by attribute.
   */
  serialize(snapshot: Snapshot) {
    const record = snapshot.record as SecurityValidatedFindingModel;

    return toKnoxiqFindingPayload(
      fromKnoxiqFindingResponse({
        validation: record.validation,
        remediation: record.remediation,
        poc: record.poc,
        exploitability: record.exploitability,
      })
    );
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'security/validated-finding': SecurityValidatedFindingSerializer;
  }
}
