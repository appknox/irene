import posthog from 'posthog-js';
import ENV from 'irene/config/environment';

/**
 * Check if analytics (PostHog) is enabled via environment config.
 */
export const isPosthogEnabled = () => {
  return Boolean(ENV.posthogApiKey && ENV.posthogApiHost);
};

/**
 * Ensures PostHog is initialized with proper masking and configuration.
 */
export const ensurePosthogInit = () => {
  if (!isPosthogEnabled()) {
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
