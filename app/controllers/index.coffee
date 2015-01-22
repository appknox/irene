`import Ember from 'ember';`
`import Notify from 'ember-notify';`
`import CONSTANTS from '../utils/constants';`
`import SocketMixin from '../mixins/socket';`

IndexController = Ember.ArrayController.extend SocketMixin,

  storeURL: null

  ratio: null

  model:( ->
    @store.all 'project'
  ).property()

  actions:

    submitURL: ->
      storeURL = @get "storeURL"
      if !CONSTANTS.STORE_URL_RE.test storeURL
        return Notify.error "Please enter a valid URL"
      data =
        storeURL: storeURL
      applicationAdapter = @store.adapterFor 'application'
      host = applicationAdapter.get 'host'
      namespace = applicationAdapter.get 'namespace'
      postUrl = [host, namespace, 'store_url'].join '/'
      that = @
      Ember.$.post postUrl, data
        .then ->
          that.set "storeURL", null
          Notify.success "Hang in there while we process your URL"
        .fail (xhr, message, status) ->
          Notify.error "A network error occured! Please try again later"


`export default IndexController;`
