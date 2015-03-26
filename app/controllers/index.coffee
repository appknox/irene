`import Ember from 'ember';`
`import Notify from 'ember-notify';`
`import CONSTANTS from 'irene/utils/constants';`
`import SocketMixin from 'irene/mixins/socket';`
`import ENV from 'irene/config/environment';`

IndexController = Ember.ArrayController.extend SocketMixin,

  needs: ['application']

  storeURL: null

  ratio: null

  model:( ->
    @get "controllers.application.currentUser.projects"
  ).property "controllers.application.currentUser"

  sortProperties: ["lastFile.updatedOn:desc"]
  sortedModel: Ember.computed.sort 'model', 'sortProperties'

  actions:

    submitURL: ->
      storeURL = @get "storeURL"
      if !CONSTANTS.STORE_URL_RE.test storeURL
        return Notify.error "Please enter a valid URL"
      data =
        storeURL: storeURL
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.storeUrl].join '/'
      that = @
      Ember.$.post postUrl, data
        .then ->
          that.set "storeURL", null
          Notify.success "Hang in there while we process your URL"
        .fail (xhr, message, status) ->
          if xhr.status is 401
            Notify.error xhr.responseJSON.message
          else
            Notify.error "A network error occured! Please try again later"

    deleteProject: (project) ->
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.deleteProject, project.get "id"].join '/'
      that = @
      Ember.$.post postUrl, data
        .then ->
          that.set "storeURL", null
          Notify.success "Hang in there while we process your URL"
        .fail (xhr, message, status) ->
          if xhr.status is 401
            Notify.error xhr.responseJSON.message
          else
            Notify.error "A network error occured! Please try again later"


`export default IndexController;`
