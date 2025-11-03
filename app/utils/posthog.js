import posthog from 'posthog-js';
import ENV from 'irene/config/environment';

const initializePostHog = () => {
  const apiKey = ENV.posthogApiKey;
  const apiHost = ENV.posthogApiHost;

  if (!apiKey || !apiHost) {
    return;
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    person_profiles: 'always',
  });
};

export default initializePostHog;
