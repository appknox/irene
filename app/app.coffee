`import Ember from 'ember';`
`import Resolver from 'irene/resolver';`
`import config from 'irene/config/environment';`
`import installIntercom from 'irene/utils/install-intercom';`
`import installPendo from 'irene/utils/install-pendo';`
`import installInspectlet from 'irene/utils/install-inspectlet';`
`import customerSuccessBox from 'irene/utils/customer-success-box';`
`import loadInitializers from 'ember-load-initializers';`
`import ENUMS from 'irene/enums'`

installIntercom()
customerSuccessBox()
installPendo()
installInspectlet()

Ember.MODEL_FACTORY_INJECTIONS = true

App = Ember.Application.extend
  modulePrefix: config.modulePrefix
  podModulePrefix: config.podModulePrefix
  Resolver: Resolver

loadInitializers App, config.modulePrefix

`export default App;`
