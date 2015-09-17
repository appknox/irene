`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`
`import ENUMS from 'irene/enums';`

ProjectSettingsController = Ember.Controller.extend

  needs: ['application']

  currentUserCollaboration: (->
    project = @get "model"
    applicationController =  @container.lookup("controller:application")
    applicationController.collaborationForProject project
  ).property "model.collaborations.@each.role"

  isCurrentUserAdmin: (->
    role = @get "currentUserCollaboration.role"
    role is ENUMS.COLLABORATION_ROLE.ADMIN
  ).property "currentUserCollaboration"

  actions:
    saveCredentials: ->
      testUser = @get "model.testUser"
      testPassword = @get "model.testPassword"
      projectId = @get "model.id"
      url = [ENV.APP.API_BASE, ENV.endpoints.saveCredentials, projectId].join '/'
      that = @
      data =
        testUser: testUser
        testPassword: testPassword
      Ember.$.post url, data
      .then (data)->
        Notify.success "Credentials Successfully updated"
      .fail ->
        Notify.error "Something went wrong whe trying to update credentials"

`export default ProjectSettingsController`
