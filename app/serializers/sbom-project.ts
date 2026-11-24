import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from '@ember-data/store';
import type Model from '@ember-data/model';

type SbomProjectHash = Record<string, unknown> & {
  latest_sb_file_detail?: Record<string, unknown> | null;
};

// The list (paged or not) or a single record, as the rows to look through.
function rowsOf(payload: unknown): SbomProjectHash[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const body = payload as { results?: SbomProjectHash[] } & SbomProjectHash;

  return Array.isArray(body.results) ? body.results : [body];
}

export default class SbomProjectSerializer extends DRFSerializer {
  // The list answer carries each project's latest SBOM file in
  // `latest_sb_file_detail` (same shape as the single sb_files/<id> answer).
  // Push those into the store so `latestSbFile` is already loaded and the row
  // makes no request for it. Older backends do not send the key.
  normalizeResponse(
    store: Store,
    primaryModelClass: Model,
    payload: unknown,
    id: string | number,
    requestType: string
  ) {
    const rows = rowsOf(payload);

    rows.forEach((row) => {
      const detail = row?.latest_sb_file_detail;

      if (detail && typeof detail === 'object') {
        store.push(store.normalize('sbom-file', detail));
      }

      delete row?.latest_sb_file_detail;
    });

    return super.normalizeResponse(
      store,
      primaryModelClass,
      payload as object,
      id,
      requestType
    );
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'sbom-project': SbomProjectSerializer;
  }
}
