`import DS from 'ember-data'`

Manualscan = DS.Model.extend
  companyName: DS.attr 'string'
  appName: DS.attr 'string'
  environment: DS.attr()
  osVersion: DS.attr 'string'
  poc: DS.attr()
  loginRequired: DS.attr 'boolean'
  userRoles: DS.attr()
  vpnRequired: DS.attr 'boolean'
  vpnDetails: DS.attr()
  appAction: DS.attr 'string'

  showProceedText: (->
    appAction = @get "appAction"
    if appAction is "Proceed"
      true
    false  
  ).property "appAction"

`export default Manualscan`
