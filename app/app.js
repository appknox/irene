import Ember from 'ember';
import Resolver from 'irene/resolver';
import config from 'irene/config/environment';
import installPendo from 'irene/utils/install-pendo';
import installHubspot from 'irene/utils/install-hubspot';
import installInspectlet from 'irene/utils/install-inspectlet';
import customerSuccessBox from 'irene/utils/customer-success-box';
import loadInitializers from 'ember-load-initializers';
import ENUMS from 'irene/enums';

config.isDevknox = 'secure.devknox.io' === location.hostname;
config.isAppknox = !config.isDevknox;

if (config.isAppknox) {
  config.platform = " | Appknox";
  config.product = ENUMS.PRODUCT.APPKNOX;
} else {
  config.platform = " | Devknox";
  config.product = ENUMS.PRODUCT.DEVKNOX;
}

customerSuccessBox();
installPendo();
installHubspot();
installInspectlet();

Ember.MODEL_FACTORY_INJECTIONS = true;

const App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
