`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`
`import csbFeature from 'irene/utils/csb-feature'`

NamespaceComponentComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  classNames: ["column"]
  added: false
  namespace: ""
  isAddingNamespace: false
  showNamespaceModal: false
  tRequestToAddNamespace: t("requestToAddNamespace")

  notAdded: (->
    !@get "added"
  ).property "added"

  actions:
    addNamespace: ->
      tRequestToAddNamespace = @get "tRequestToAddNamespace"
      namespace = @get "namespace"
      if !namespace
        return @get("notify").error "Please enter any namespace", ENV.notifications
      data =
        namespace: namespace
      csbFeature(ENV.csb.namespaceAdded)
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
