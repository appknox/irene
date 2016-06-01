`import Ember from 'ember';`
`import Resolver from 'ember/resolver';`
`import loadInitializers from 'ember/load-initializers';`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`
`import installRaven from 'irene/utils/install-raven';`
`import installIntercom from 'irene/utils/install-intercom';`

installRaven()
installIntercom()

Ember.$.ajaxSetup
  type: "POST"
  data: {}
  dataType: 'json'
  xhrFields:
    withCredentials: true
  crossDomain: true

Ember.MODEL_FACTORY_INJECTIONS = true

App = Ember.Application.extend
  modulePrefix: ENV.modulePrefix
  podModulePrefix: ENV.podModulePrefix
  Resolver: Resolver

loadInitializers App, ENV.modulePrefix

`export default App;`
