`import Ember from 'ember';`
`import Resolver from 'irene/resolver';`
`import config from 'irene/config/environment';`
`import installIntercom from 'irene/utils/install-intercom';`
`import loadInitializers from 'ember-load-initializers';`

config.isDevknox = 'secure.devknox.io' is location.hostname
config.isAppknox = !config.isDevknox

installIntercom()

Ember.MODEL_FACTORY_INJECTIONS = true

App = Ember.Application.extend
  modulePrefix: config.modulePrefix
  podModulePrefix: config.podModulePrefix
  Resolver: Resolver

loadInitializers App, config.modulePrefix

`export default App;`
