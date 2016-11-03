`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

NamespaceComponentComponent = Ember.Component.extend
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
      postUrl = [ENV.APP.API_BASE, ].join '/'
      that = @
      debugger
      @get("ajax").post ENV.endpoints.namespaceAdd, data: data
      .then ->
        that.set "namespace", ""
        that.get("notify").success "we have received your request to add a new namespace."
      .catch (xhr, message, status) ->
        debugger
        if xhr.status is 403
          that.get("notify").error xhr.responseJSON.message
        else
          that.get("notify").error "A network error occured! Please try again later"

    toggleNamspaceModal: ->
      @set "showNamespaceModal", !@get "showNamespaceModal"

`export default NamespaceComponentComponent`
