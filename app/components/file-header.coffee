`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums';`
`import { translationMacro as t } from 'ember-i18n'`


isEmpty = (inputValue)->
  return Ember.isEmpty inputValue

FileHeaderComponent = Ember.Component.extend

  i18n: Ember.inject.service()
  trial: Ember.inject.service()

  globalAlpha:0.4
  radiusRatio:0.9

  tPasswordCopied: t("passwordCopied")
  tPleaseTryAgain: t("pleaseTryAgain")
  tReportIsGettingGenerated: t("reportIsGettingGenerated")
  tManualRequested: t("manualRequested")
  tStartingScan: t("startingScan")

  dynamicScanModal: false
  apiScanModal: false
  isRequestingManual: false
  isStartingRescan: false
  showRemoveRoleConfirmBox: false

  userRoles: []
  environments: ["staging", "production"]
  appActions: ["proceed", "halt"]
  loginStatuses: ["yes", "no"]
  vpnStatuses: ["yes", "no"]

  manualscan: (->
    projectId = @get "file.project.id"
    @get("store").findRecord "manualscan", projectId
  ).property()

  filteredEnvironments: (->
    environments = @get "environments"
    environment = @get "manualscan.environment"
    environments.filter (env) ->
      environment isnt env
  ).property "environments", "manualscan.environment"

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

  availableRoles: Ember.computed.filter 'manualscan.userRoles', (userRole) ->
    id = userRole.userRole[0].id
    deletedRole = @get "deletedRole"
    id isnt deletedRole

  userRoleCount: Ember.computed.alias 'manualscan.userRoles.length'

  hasUserRoles: Ember.computed.gt 'userRoleCount', 0

  actions:
    getPDFReportLink: ->
      analytics.feature(ENV.csb.feature.reportDownload, ENV.csb.module.report, ENV.csb.product.appknox)
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
      analytics.feature(ENV.csb.feature.runDynamicScan, ENV.csb.module.security, ENV.csb.product.appknox)
      @set "isApiScanEnabled", false
      @send "setAPIScanOption"

    runAPIScan: ->
      analytics.feature(ENV.csb.feature.runAPIScan, ENV.csb.module.security, ENV.csb.product.appknox)
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
      username1 = @get "username1"
      username2 = @get "username2"
      password1 = @get "password1"
      password2 = @get "password2"
      for inputValue in [newUserRole, username1, username2, password1, password2]
        return @get("notify").error "Please enter all the values" if isEmpty inputValue
      userRoles = @get "manualscan.userRoles"
      uniqueID = Math.random().toString(36).substr(2, 9);
      roleId = "userrole_#{uniqueID}"
      userRole = {
        "userRole": [
          {
            "id": roleId,
            "role": newUserRole,
            "credentail": [
              {
                "username": username1,
                "password": password1
              },
              {
                "username": username2
                "password": password2
              }
            ]
          }
        ]
      }
      userRoles.addObject(userRole)
      @set "manualscan.userRoles", userRoles
      @get("notify").success "Role added successfully"
      @setProperties({
        newUserRole: ""
        username1: ""
        username2: ""
        password1: ""
        password2: ""
        })

    saveManualScanForm: ->
      companyName = @get "manualscan.companyName"
      appName = @get "manualscan.appName"
      environment =  @$('#app-env').val()
      osVersion = @get "manualscan.osVersion"
      appAction = @get "manualscan.appAction"

      loginRequired =  @get "manualscan.loginRequired"
      userRoles = @get "manualscan.userRoles"

      vpnRequired =  @get "manualscan.vpnRequired"
      
      vpnAddress = @get "manualscan.vpnDetails.address"
      vpnPort = @get "manualscan.vpnDetails.port"
      vpnUsername = @get "manualscan.vpnDetails.username"
      vpnPassword = @get "manualscan.vpnDetails.password"

      pocName = @get "manualscan.poc.name"
      pocEmail = @get "manualscan.poc.email"

      for inputValue in [osVersion]
        return @get("notify").error "Please enter the OS version" if isEmpty inputValue

      if loginRequired
        return @get("notify").error "Please enter user roles" if isEmpty userRoles

      if vpnRequired
        for inputValue in [vpnAddress, vpnPort]
          return @get("notify").error "Please enter VPN details" if isEmpty inputValue

      for inputValue in [pocName, pocEmail]
        return @get("notify").error "Please enter point of contact details" if isEmpty inputValue

      vpnDetails =
        address: vpnAddress
        port: vpnPort
        username: vpnUsername
        password: vpnPassword

      contact =
        contact_name: pocName
        contact_email: pocEmail

      additionalComments = @get "additionalComments"

      data =
        company_name: companyName
        app_name: appName
        app_env: environment
        min_os_version: osVersion
        app_scan_status: appAction
        require_account_login: loginRequired
        userroles: userRoles
        vpn_required: vpnRequired
        vpn_details: vpnDetails
        contact: contact
        additional_comments: additionalComments

      that = @
      projectId = @get("file.project.id")
      url = [ENV.endpoints.manualScanForm, projectId].join '/'
      @get("ajax").post url
      .then (result) ->
        that.send "requestManualScan"

    requestManualScan: ->
      analytics.feature(ENV.csb.feature.requestManualScan, ENV.csb.module.security, ENV.csb.product.appknox)
      tManualRequested = @get "tManualRequested"
      fileId = @get "file.id"
      that = @
      url = [ENV.endpoints.manual, fileId].join '/'
      @set "isRequestingManual", true
      @get("ajax").request url
      .then (result) ->
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
      that = @
      fileId = @get "file.id"
      data =
        file_id: fileId
      @set "isStartingRescan", true
      @get("ajax").post ENV.endpoints.rescan, data: data
      .then (result) ->
        that.set "isStartingRescan", false
        that.get("notify").info "Rescan initiated"
        that.set "showRescanModal", false
      .catch (error) ->
        that.set "isStartingRescan", false
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default FileHeaderComponent`
