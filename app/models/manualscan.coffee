`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`

Manualscan = DS.Model.extend
  appEnv: DS.attr 'string'
  minOsVersion: DS.attr 'string'
  contact: DS.attr()
  loginRequired: DS.attr 'boolean'
  userRoles: DS.attr()
  vpnRequired: DS.attr 'boolean'
  vpnDetails: DS.attr()
  appAction: DS.attr 'string'
  additionalComments: DS.attr 'string'

  filteredAppEnv: (->
    appEnv = parseInt @get "appEnv"
    if isNaN(appEnv)
      return ENUMS.APP_ENV.NO_PREFERENCE
  ).property "appEnv"

  filteredAppAction: (->
    appAction = parseInt @get "appAction"
    if isNaN(appAction)
      return ENUMS.APP_ACTION.NO_PREFERENCE
  ).property "appAction"

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
