import posthog from 'posthog-js';
import ENV from 'irene/config/environment';

const initializePostHog = () => {
  posthog.init(ENV.posthogApiKey, {
    api_host: ENV.posthogApiHost,
    person_profiles: 'always',
  });
};

export default initializePostHog;
