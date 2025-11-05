import posthog from 'posthog-js';
import ENV from 'irene/config/environment';
import type OrganizationModel from 'irene/models/organization';
import type UserModel from 'irene/models/user';

const isEnabled = () => {
  return Boolean(ENV.posthogApiKey && ENV.posthogApiHost);
};

const ensureInit = () => {
  if (!isEnabled()) {
    return;
  }

  posthog.init(ENV.posthogApiKey, {
    api_host: ENV.posthogApiHost,
    person_profiles: 'always',
    session_recording: {
      maskTextSelector: '.posthog-sensitive',
    },
  });
};

export const initializePostHog = () => {
  ensureInit();
};

export const registerPostHogOrganization = (
  user: UserModel,
  organization: OrganizationModel | null
) => {
  if (!isEnabled()) {
    return;
  }

  try {
    if (posthog._isIdentified()) {
      return;
    } else if (user?.id && organization?.id) {
      posthog.identify(user.id, {
        email: user?.email,
        username: user?.username,
        org_id: organization?.id,
        org_name: organization?.name,
      });
    }
  } catch (e) {
    console.warn('posthog register failed', e);
  }
};

export const unregisterPostHog = () => {
  if (!isEnabled()) {
    return;
  }

  posthog.stopSessionRecording();
  posthog.reset();
};

export default initializePostHog;
