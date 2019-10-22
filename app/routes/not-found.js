import config from 'irene/config/environment';
import Route from '@ember/routing/route';

const NotFoundRoute = Route.extend({
  title: `Not Found${config.platform}`,
  templateName: 'error'
});

export default NotFoundRoute;
