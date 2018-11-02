import config from 'irene/config/environment';
import Route from '@ember/routing/route';

const LoginRoute = Route.extend({

  title: `Login${config.platform}`});

export default LoginRoute;
