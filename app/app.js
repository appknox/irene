import ENUMS from 'irene/enums';
import config from 'irene/config/environment';
import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import { registerDateLibrary } from 'ember-power-calendar';
import DateUtils from 'irene/utils/power-calendar-dayjs';
import 'iconify-icon';

config.isDevknox = 'secure.devknox.io' === location.hostname;
config.isAppknox = !config.isDevknox;

if (config.isAppknox) {
  config.platform = ' | Appknox';
  config.product = ENUMS.PRODUCT.APPKNOX;
} else {
  config.platform = ' | Devknox';
  config.product = ENUMS.PRODUCT.DEVKNOX;
}

registerDateLibrary(DateUtils);

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
