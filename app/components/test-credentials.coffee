`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

TestCredentialsComponent = Ember.Component.extend

  project: null

  actions:

    saveCredentials: ->
      testUser = @get "project.testUser"
      testPassword = @get "project.testPassword"
      projectId = @get "project.id"
      that = @
      data =
        testUser: testUser
        testPassword: testPassword
      url = [ENV.endpoints.saveCredentials, projectId].join '/'
      @get("ajax").post url, data: data
      .then (data)->
        that.get("notify").success "Credentials Successfully updated"
      .catch ->
        that.get("notify").error "Something went wrong whe trying to update credentials"

`export default TestCredentialsComponent`
