import config from 'irene/config/environment';
import Route from '@ember/routing/route';

const ResetRoute = Route.extend({
  title: `Reset Password${config.platform}`,
  model(params) {
    return params;
  }
});

export default ResetRoute;
