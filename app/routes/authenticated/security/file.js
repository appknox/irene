import config from 'irene/config/environment';
import Route from '@ember/routing/route';

export default Route.extend({
  title: `File Details${config.platform}`,
});
