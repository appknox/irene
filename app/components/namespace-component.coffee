`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

NamespaceComponentComponent = Ember.Component.extend
  added: false
  namespace: ""

  notAdded: (->
    !@get "added"
  ).property "added"

  actions:

    addNamespace: ->
      data =
        namespace: @get "namespace"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.namespaceAdd].join '/'
      that = @
      Ember.$.post postUrl, data
      .then ->
        @get("notify").success "we have received your request to add a new namespace."
      .fail (xhr, message, status) ->
        if xhr.status is 403
          @get("notify").error xhr.responseJSON.message
        else
          @get("notify").error "A network error occured! Please try again later"
`export default NamespaceComponentComponent`
