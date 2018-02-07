`import DS from 'ember-data'`

Manualscan = DS.Model.extend
  appEnv: DS.attr()
  minOsVersion: DS.attr 'string'
  contact: DS.attr()
  loginRequired: DS.attr 'boolean'
  userRoles: DS.attr()
  vpnRequired: DS.attr 'boolean'
  vpnDetails: DS.attr()
  appAction: DS.attr 'string'
  additionalComments: DS.attr 'string'

  showProceedText: (->
    appAction = @get "appAction"
    if appAction is "proceed"
      return true
    false
  ).property "appAction"

  loginStatus: (->
    loginRequired = @get "loginRequired"
    if @get "loginRequired"
      return "yes"
    "no"
  ).property "loginRequired"

  vpnStatus: (->
    vpnRequired = @get "vpnRequired"
    if @get "vpnRequired"
      return "yes"
    "no"
  ).property "vpnRequired"

`export default Manualscan`
