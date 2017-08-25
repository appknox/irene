`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

NamespaceModalComponent = Ember.Component.extend

  i18n: Ember.inject.service()
  showNamespaceModal: false

  newNamespaceObserver: Ember.observer "realtime.namespace", ->
    @set "showNamespaceModal", true


  tRequestToAddNamespace: t("requestToAddNamespace")

  actions:
    addNamespace: ->
      tRequestToAddNamespace = @get "tRequestToAddNamespace"
      data =
        namespace: @get "realtime.namespace"
      that = @
      @get("ajax").post ENV.endpoints.namespaceAdd, data: data
      .then ->
        that.get("notify").success tRequestToAddNamespace
        that.set "showNamespaceModal", false
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default NamespaceModalComponent`
