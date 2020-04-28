import ENUMS from 'irene/enums';
import config from 'irene/config/environment';
import installPendo from 'irene/utils/install-pendo';
import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import installStripe from 'irene/utils/install-stripe';
import installCrisp from 'irene/utils/install-crisp';
import installHotjar from 'irene/utils/install-hotjar';
import customerSuccessBox from 'irene/utils/customer-success-box';

config.isDevknox = 'secure.devknox.io' === location.hostname;
config.isAppknox = !config.isDevknox;

if (config.isAppknox) {
  config.platform = " | Appknox";
  config.product = ENUMS.PRODUCT.APPKNOX;
} else {
  config.platform = " | Devknox";
  config.product = ENUMS.PRODUCT.DEVKNOX;
}

installStripe();
installPendo();
installCrisp();
installHotjar();
customerSuccessBox();

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
