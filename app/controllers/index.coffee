`import Ember from 'ember';`
`import Notify from 'ember-notify';`
`import CONSTANTS from 'irene/utils/constants';`
`import ENV from 'irene/config/environment';`

IndexController = Ember.ArrayController.extend

  needs: ['application']
  storeURL: null
  ratio: null
  percent: 0
  isUploading: false

  displayText: (->
    if @get "isUploading"
      "Uploading #{parseInt @get "percent"}% ..."
    else
      "Upload App"
  ).property "isUploading", "percent"

  setRatioOnInit: (->
    ratio = @store.push @store.normalize "ratio",
      type: 'ratio'
      id: 1
      affected: 0
      unaffected: 1
    @set "ratio", ratio
  ).on "init"

  model:( ->
    collaborations = @get "controllers.application.currentUser.collaborations"
    return if Ember.isEmpty collaborations
    projects = []
    count = collaborations.length
    while count > 0
      count -= 1
      collaboration = collaborations.objectAt count
      p = collaboration.get "project"
      projects.push(p) if p not in projects
    projects
  ).property "controllers.application.currentUser.collaborations.@each"

  sortProperties: ["lastFile.updatedOn:desc"]
  sortedModel: Ember.computed.sort 'model', 'sortProperties'

  actions:

    submitURL: ->
      storeURL = @get "storeURL"
      if CONSTANTS.WINDOWS_STORE_URL_RE.test(storeURL)
        data =
          storeURL: storeURL
      else if CONSTANTS.ANDROID_STORE_URL_RE.test(storeURL)
        data =
          storeURL: storeURL
      else
        return Notify.error "Please enter a valid URL"

      postUrl = [ENV.APP.API_BASE, ENV.endpoints.storeUrl].join '/'
      that = @
      Ember.$.post postUrl, data
      .then ->
        that.set "storeURL", null
        Notify.success "Hang in there while we process your URL"
      .fail (xhr, message, status) ->
        if xhr.status is 403
          Notify.error xhr.responseJSON.message
        else
          Notify.error "A network error occured! Please try again later"

    deleteProject: (project) ->
      return if !confirm "Do you want to delete `#{project.get "name"}` project?"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.deleteProject, project.get "id"].join '/'
      that = @
      Ember.$.post postUrl
        .then ->
          Notify.success "Your project will be deleted momentarily."
        .fail (xhr, message, status) ->
          Notify.error xhr.responseJSON.message

    tourDashboard: ->
      @set 'controllers.application.onboard.activeTour', ENV.TOUR.dashboard


`export default IndexController;`
