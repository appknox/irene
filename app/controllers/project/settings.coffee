`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`

ProjectSettingsController = Ember.Controller.extend

  needs: ['application']

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
