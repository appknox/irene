`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`
`import triggerAnalytics from 'irene/utils/trigger-analytics'`

NamespaceComponentComponent = Ember.Component.extend

  namespace: ""
  added: false
  classNames: ["column"]
  isAddingNamespace: false
  showNamespaceModal: false
  i18n: Ember.inject.service()
  tRequestToAddNamespace: t("requestToAddNamespace")
  tPleaseEnterAnyNamespace: t("pleaseEnterAnyNamespace")

  notAdded: (->
    !@get "added"
  ).property "added"

  actions:
    
    addNamespace: ->
      tRequestToAddNamespace = @get "tRequestToAddNamespace"
      tPleaseEnterAnyNamespace = @get "tPleaseEnterAnyNamespace"
      namespace = @get "namespace"
      if !namespace
        return @get("notify").error tPleaseEnterAnyNamespace, ENV.notifications
      data =
        namespace: namespace
      triggerAnalytics('feature',ENV.csb.namespaceAdded)
      that = @
      @set "isAddingNamespace", true
      @get("ajax").post ENV.endpoints.namespaceAdd, data: data
      .then ->
        that.set "isAddingNamespace", false
        that.set "namespace", ""
        that.get("notify").success tRequestToAddNamespace
        that.set "showNamespaceModal", false
      .catch (error) ->
        that.set "isAddingNamespace", false
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

    toggleNamespaceModal: ->
      @set "showNamespaceModal", !@get "showNamespaceModal"

`export default NamespaceComponentComponent`
