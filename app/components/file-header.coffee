`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import ENUMS from 'irene/enums'`
`import { translationMacro as t } from 'ember-i18n'`
`import triggerAnalytics from 'irene/utils/trigger-analytics'`


isEmpty = (inputValue)->
  return Ember.isEmpty inputValue

FileHeaderComponent = Ember.Component.extend

  roleId: 0
  userRoles: []
  globalAlpha:0.4
  radiusRatio:0.9

  apiScanModal: false
  isStartingRescan: false
  dynamicScanModal: false
  isRequestingManual: false
  showRemoveRoleConfirmBox: false

  vpnStatuses: ["yes", "no"]
  loginStatuses: ["yes", "no"]
  appActions: ["halt", "proceed"]
  environments: ["staging", "production"]

  i18n: Ember.inject.service()
  trial: Ember.inject.service()

  tStartingScan: t("startingScan")
  tPasswordCopied: t("passwordCopied")
  tPleaseTryAgain: t("pleaseTryAgain")
  tManualRequested: t("manualRequested")
  tRoleAdded: t("modalCard.manual.roleAdded")
  tPleaseEnterPOC: t("modalCard.manual.pleaseEnterPOC")
  tReportIsGettingGenerated: t("reportIsGettingGenerated")
  tPleaseEnterAllValues: t("modalCard.manual.pleaseEnterAllValues")
  tPleaseEnterOSVersion: t("modalCard.manual.pleaseEnterOSVersion")
  tPleaseEnterUserRoles: t("modalCard.manual.pleaseEnterUserRoles")
  tPleaseEnterVPNDetails: t("modalCard.manual.pleaseEnterVPNDetails")

  manualscan: (->
    fileId = @get "file.id"
    @get("store").findRecord "manualscan", fileId
  ).property()

  filteredEnvironments: (->
    environments = @get "environments"
    appEnv = @get "manualscan.appEnv"
    environments.filter (env) ->
      appEnv isnt env
  ).property "environments", "manualscan.appEnv"

  filteredAddActions: (->
    appActions = @get "appActions"
    appAction = @get "manualscan.appAction"
    appActions.filter (action) ->
      appAction isnt action
  ).property "appActions", "manualscan.appAction"

  filteredLoginStatuses: (->
    loginStatuses = @get "loginStatuses"
    loginStatus = @get "manualscan.loginStatus"
    loginStatuses.filter (status) ->
      loginStatus isnt status
  ).property "loginStatuses", "manualscan.loginStatus"

  filteredVpnStatuses: (->
    vpnStatuses = @get "vpnStatuses"
    vpnStatus = @get "manualscan.vpnStatus"
    vpnStatuses.filter (status) ->
      vpnStatus isnt status
  ).property "vpnStatuses", "manualscan.vpnStatus"

  chartOptions: (->
    legend: { display: false }
    animation: {animateRotate: false}
  ).property()

  didInsertElement: ->
    tPasswordCopied = @get "tPasswordCopied"
    tPleaseTryAgain = @get "tPleaseTryAgain"
    clipboard = new Clipboard('.copy-password')
    @set "clipboard", clipboard
    that = @
    clipboard.on 'success', (e) ->
      that.get("notify").info tPasswordCopied
      e.clearSelection()
    clipboard.on 'error', ->
      that.get("notify").error tPleaseTryAgain

  willDestroyElement: ->
    clipboard = @get "clipboard"
    clipboard.destroy()

  confirmCallback: ->
    deletedRole = @get "deletedRole"
    availableRoles = @get "availableRoles"
    @set "manualscan.userRoles", availableRoles
    @set "showRemoveRoleConfirmBox", false

  allUserRoles: (->
    userRoles = @get "manualscan.userRoles"
    roleId = @get "roleId"
    that = @
    userRoles.forEach (role) ->
      roleId = roleId + 1
      role.id = roleId
      that.set "roleId", roleId
    userRoles
  ).property "manualscan.userRoles"

  availableRoles: Ember.computed.filter 'allUserRoles', (userRole) ->
    id = userRole.id
    deletedRole = @get "deletedRole"
    id isnt deletedRole

  userRoleCount: Ember.computed.alias 'manualscan.userRoles.length'

  hasUserRoles: Ember.computed.gt 'userRoleCount', 0

  actions:
    getPDFReportLink: ->
      triggerAnalytics('feature', ENV.csb.reportDownload)
      tReportIsGettingGenerated = @get "tReportIsGettingGenerated"
      that = @
      fileId = @get "file.id"
      url = [ENV.endpoints.signedPdfUrl, fileId].join '/'
      @get("ajax").request url
      .then (result) ->
        window.location = result.url
      .catch (error) ->
        that.get("notify").error tReportIsGettingGenerated
        for error in error.errors
          that.get("notify").error error.detail?.message

    dynamicScan: ->
      file = @get "file"
      file.setBootingStatus()
      file_id = @get "file.id"
      dynamicUrl = [ENV.endpoints.dynamic, file_id].join '/'
      @get("ajax").request dynamicUrl
      .catch (error) ->
        file.setNone()
        for error in error.errors
          that.get("notify").error error.detail?.message

    setAPIScanOption: ->
      tStartingScan = @get "tStartingScan"
      isApiScanEnabled = @get "isApiScanEnabled"
      project_id = @get "file.project.id"
      apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join '/'
      that = @
      data =
        isApiScanEnabled: isApiScanEnabled
      @get("ajax").post apiScanOptions, data: data
      .then (data)->
        that.send "closeModal"
        that.send "dynamicScan"
        that.get("notify").success tStartingScan
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    doNotRunAPIScan: ->
      triggerAnalytics('feature', ENV.csb.runDynamicScan)
      @set "isApiScanEnabled", false
      @send "setAPIScanOption"

    runAPIScan: ->
      triggerAnalytics('feature', ENV.csb.runAPIScan)
      @set "isApiScanEnabled", true
      @send "setAPIScanOption"

    showURLFilter: (param)->
      @set "showAPIURLFilterScanModal", true
      if param is 'api'
        @set "showAPIScanModal", false
        @set "apiScanModal", true
        @set "dynamicScanModal", false
      if param is 'dynamic'
        @set "showRunDynamicScanModal", false
        @set "dynamicScanModal", true
        @set "apiScanModal", false

    loginRequired: ->
      loginRequiredText = @$('#app-login-required').val()
      @set "manualscan.loginRequired", false
      if loginRequiredText is "yes"
        @set "manualscan.loginRequired", true

    vpnRequired: ->
      vpnRequired = @$('#vpn-required').val()
      @set "manualscan.vpnRequired", false
      if vpnRequired is "yes"
        @set "manualscan.vpnRequired", true

    requiredAppAction: ->
      appAction = @$('#required-app-action').val()
      @set "manualscan.showProceedText", false
      if appAction is "proceed"
        @set "manualscan.showProceedText", true
      @set "manualscan.appAction", appAction

    openRemoveUserRoleConfirmBox: (param)->
      @set "deletedRole", param
      @set "showRemoveRoleConfirmBox", true

    addUserRole: ->
      newUserRole = @get "newUserRole"
      username = @get "username"
      password = @get "password"
      tRoleAdded = @get "tRoleAdded"
      tPleaseEnterAllValues = @get "tPleaseEnterAllValues"
      for inputValue in [newUserRole, username, password]
        return @get("notify").error tPleaseEnterAllValues if isEmpty inputValue
      userRoles = @get "manualscan.userRoles"
      roleId = @get "roleId"
      roleId = roleId + 1
      userRole = {
        "id": roleId
        "role": newUserRole,
        "username": username,
        "password": password
      }
      if Ember.isEmpty userRoles
        userRoles = []
      userRoles.addObject(userRole)
      @set "manualscan.userRoles", userRoles
      @set "roleId", roleId
      @get("notify").success tRoleAdded
      @setProperties({
        newUserRole: ""
        username: ""
        password: ""
        })

    saveManualScanForm: ->
      appName = @get "file.name"
      appEnv =  @$('#app-env').val()
      appAction =  @$('#required-app-action').val()
      minOsVersion = @$('#min-os-version').val()

      loginRequired =  @get "manualscan.loginRequired"
      if !loginRequired
        loginRequired = false

      userRoles = @get "manualscan.userRoles"

      if userRoles
        userRoles.forEach (userRole) ->
          delete userRole.id

      vpnRequired =  @get "manualscan.vpnRequired"
      if !vpnRequired
        vpnRequired = false

      vpnAddress = @$('#vpn-address').val()
      vpnPort = @$('#vpn-port').val()
      vpnUsername = @$('#vpn-username').val()
      vpnPassword = @$('#vpn-password').val()

      contactName = @$('#contact-name').val()
      contactEmail = @$('#contact-email').val()

      tPleaseEnterOSVersion = @get "tPleaseEnterOSVersion"
      tPleaseEnterUserRoles = @get "tPleaseEnterUserRoles"
      tPleaseEnterVPNDetails = @get "tPleaseEnterVPNDetails"
      tPleaseEnterPOC = @get "tPleaseEnterPOC"

      for inputValue in [minOsVersion]
        return @get("notify").error tPleaseEnterOSVersion if isEmpty inputValue

      if loginRequired
        return @get("notify").error tPleaseEnterUserRoles if isEmpty userRoles

      if vpnRequired
        for inputValue in [vpnAddress, vpnPort]
          return @get("notify").error tPleaseEnterVPNDetails if isEmpty inputValue

      for inputValue in [contactName, contactEmail]
        return @get("notify").error tPleaseEnterPOC if isEmpty inputValue

      vpnDetails =
        address: vpnAddress
        port: vpnPort
        username: vpnUsername
        password: vpnPassword

      contact =
        name: contactName
        email: contactEmail

      additionalComments = @get "additionalComments"

      data =
        app_name: appName
        app_env: appEnv
        min_os_version: minOsVersion
        app_action: appAction
        login_required: loginRequired
        user_roles: userRoles
        vpn_required: vpnRequired
        vpn_details: vpnDetails
        contact: contact
        additional_comments: additionalComments

      that = @
      tManualRequested = @get "tManualRequested"
      @set "isRequestingManual", true
      fileId = @get("file.id")
      url = [ENV.endpoints.manualscans, fileId].join '/'
      @get("ajax").put url, data: JSON.stringify(data), contentType: 'application/json'
      .then (result) ->
        triggerAnalytics('feature', ENV.csb.requestManualScan)
        that.set "isRequestingManual", false
        that.get("notify").info tManualRequested
        that.set "file.ifManualNotRequested", false
        that.set "showManualScanModal", false
      .catch (error) ->
        that.set "isRequestingManual", false
        for error in error.errors
          that.get("notify").error error.detail?.message

    openAPIScanModal: ->
      platform = @get "file.project.platform"
      if platform in [ENUMS.PLATFORM.ANDROID,ENUMS.PLATFORM.IOS] # TEMPIOSDYKEY
        @set "showAPIScanModal", true
      else
        @send "doNotRunAPIScan"

    goBack: ->
      @set "showAPIURLFilterScanModal", false
      if @get "apiScanModal"
        @set "showAPIScanModal", true
      if @get "dynamicScanModal"
        @set "showRunDynamicScanModal", true

    closeModal: ->
      @set "showAPIScanModal", false
      @set "showAPIURLFilterScanModal", false
      @set "showRunDynamicScanModal", false

    closeSubscribeModal: ->
      @set "showSubscribeModal", false

    openSubscribeModal: ->
      @set "showSubscribeModal", true

    openManualScanModal: ->
      @set "showManualScanModal", true

    closeManualScanModal: ->
      @set "showManualScanModal", false

    openRescanModal: ->
      @set "showRescanModal", true

    closeRescanModal: ->
      @set "showRescanModal", false

    openRunDynamicScanModal: ->
      @set "showRunDynamicScanModal", true

    closeRunDynamicScanModal: ->
      @set "showRunDynamicScanModal", false

    subscribePlan: ->
      window.location.href = "/billing"

    dynamicShutdown: ->
      file = @get "file"
      file.setShuttingDown()
      @set "isPoppedOut", false
      file_id = @get "file.id"
      shutdownUrl = [ENV.endpoints.dynamicShutdown, file_id].join '/'
      @get("ajax").request shutdownUrl
      .then () ->
        file.setNone()
      .catch (error) ->
        file.setNone()
        for error in error.errors
          that.get("notify").error error.detail?.message

    rescanApp: ->
      tRescanInitiated = @get "tRescanInitiated"
      that = @
      fileId = @get "file.id"
      data =
        file_id: fileId
      @set "isStartingRescan", true
      @get("ajax").post ENV.endpoints.rescan, data: data
      .then (result) ->
        that.set "isStartingRescan", false
        that.get("notify").info tRescanInitiated
        that.set "showRescanModal", false
      .catch (error) ->
        that.set "isStartingRescan", false
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default FileHeaderComponent`
