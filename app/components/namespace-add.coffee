`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`

NamespaceAddComponent = Ember.Component.extend
  needs: ['application']
  classNames: ['modal', 'fade', 'in']
  classNameBindings: ['show']
  show: false
  appCtrlr: null
  added: false
  namespace: ""

  attachToApp: (->
    @get("appCtrlr")?.set "namespaceAdd", @
  ).on "init"

  notAdded: (->
    !@get "added"
  ).property "added"

  actions:

    closeModal: ->
      @set "show", false

    showModal: ->
      @set "show", true

    addNamespace: ->
      data =
        namespace: @get "namespace"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.namespaceAdd].join '/'
      that = @
      Ember.$.post postUrl, data
      .then ->
        Notify.success "we have received your request to add a new namespace."
      .fail (xhr, message, status) ->
        if xhr.status is 403
          Notify.error xhr.responseJSON.message
        else
          Notify.error "A network error occured! Please try again later"

`export default NamespaceAddComponent`
