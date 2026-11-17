import type Store from 'ember-data/store';
import type ApiscanAutomationPreferenceModel from 'irene/models/apiscan-automation-preference';

// The nested adapter resets its namespace after every response, so this must
// run again immediately before each request that touches the preference.
export function setApiscanAutomationPreferenceNamespace(
  store: Store,
  profileId: string | number
) {
  store
    .adapterFor('apiscan-automation-preference')
    .setNestedUrlNamespace(String(profileId));
}

/**
 * Loads the API Scan Automation preference for a profile, namespacing the
 * nested adapter to that profile first.
 */
export default function fetchApiscanAutomationPreference(
  store: Store,
  profileId: string | number
): Promise<ApiscanAutomationPreferenceModel> {
  setApiscanAutomationPreferenceNamespace(store, profileId);

  return store.queryRecord('apiscan-automation-preference', {});
}
