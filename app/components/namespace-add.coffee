`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`
`import ModalBoxMixin from 'irene/mixins/modal-box'`

NamespaceAddComponent = Ember.Component.extend ModalBoxMixin,
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
        Notify.success "we have received your request to add a new namespace."
      .fail (xhr, message, status) ->
        if xhr.status is 403
          Notify.error xhr.responseJSON.message
        else
          Notify.error "A network error occured! Please try again later"

`export default NamespaceAddComponent`
