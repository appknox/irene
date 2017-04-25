`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

NamespaceComponentComponent = Ember.Component.extend
  classNames: ["column" , "is-one-third"]
  added: false
  namespace: ""
  showNamespaceModal: false

  notAdded: (->
    !@get "added"
  ).property "added"

  actions:
    addNamespace: ->
      data =
        namespace: @get "namespace"
      that = @
      @get("ajax").post ENV.endpoints.namespaceAdd, data: data
      .then ->
        that.set "namespace", ""
        that.get("notify").success "we have received your request to add a new namespace."
        that.set "showNamespaceModal", false
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    toggleNamspaceModal: ->
      @set "showNamespaceModal", !@get "showNamespaceModal"

`export default NamespaceComponentComponent`
