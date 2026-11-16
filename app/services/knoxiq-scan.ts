import Service, { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';
import type KnoxiqScanModel from 'irene/models/knoxiq-scan';

/**
 * Dedupes the knoxiq-scan queryRecord across sibling components (no shared
 * arg path between them). Only in-flight requests are shared, not results.
 */
export default class KnoxiqScanService extends Service {
  @service declare store: Store;

  private readonly inFlight = new Map<
    string,
    Promise<KnoxiqScanModel | null>
  >();

  fetch(fileId: string): Promise<KnoxiqScanModel | null> {
    const existing = this.inFlight.get(fileId);

    if (existing !== undefined) {
      return existing;
    }

    const promise = this.queryRecord(fileId).finally(() => {
      this.inFlight.delete(fileId);
    });

    this.inFlight.set(fileId, promise);

    return promise;
  }

  private queryRecord(fileId: string): Promise<KnoxiqScanModel | null> {
    return waitForPromise(
      this.store.queryRecord('knoxiq-scan', { id: fileId, fileId })
    );
  }
}

declare module '@ember/service' {
  interface Registry {
    'knoxiq-scan': KnoxiqScanService;
  }
}
