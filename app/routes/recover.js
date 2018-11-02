import config from 'irene/config/environment';
import Route from '@ember/routing/route';

const RecoverRoute = Route.extend({
  title: `Recover Password${config.platform}`});

export default RecoverRoute;
