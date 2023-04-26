import { debug } from '@ember/debug';
import ENV, { Csb } from 'irene/config/environment';

const triggerAnalytics = (type: CsbAnalyticsType, data: CsbAnalyticsData) => {
  if (typeof window.analytics !== 'undefined') {
    try {
      if (type === 'feature' && 'feature' in data) {
        return window.analytics.feature(
          data.feature,
          data.module,
          data.product
        );
      }

      if (type === 'logout') {
        return window.analytics.logout();
      }

      if (type === 'login' && 'userName' in data) {
        const logInFeatureData = ENV.csb['userLoggedIn'] as Csb;

        const {
          userName: custom_username,
          userEmail: email,
          accountId: account_id,
          accountName: custom_Organization,
          userRole: custom_role,
        } = data;

        window.analytics.login(data.userId, data.accountId);

        // Identify user to populate name and/or email along with proper org association on CSB dashboard
        const userIdentificationObject = {
          custom_username,
          email,
          account_id,
          custom_Organization,
          custom_role,
          first_name: custom_username,
        };

        window.analytics.identify(data.userId, userIdentificationObject);

        // To publish user's login as an activity on the CSB dashboard and visulaization
        return window.analytics.feature(
          logInFeatureData.feature,
          logInFeatureData.module,
          logInFeatureData.product
        );
      }
    } catch (error) {
      debug('CSB analytics API call failed.Check latest documentation');
    }
  }
};

export default triggerAnalytics;
