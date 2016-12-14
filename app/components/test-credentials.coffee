`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

TestCredentialsComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  project: null

  tCredentialsUpdated: t("credentialsUpdated")
  tCredentialsNotUpdated: t("credentialsNotUpdated")

  actions:

    saveCredentials: ->
      tCredentialsUpdated = @get "credentialsUpdated"
      tCredentialsNotUpdated = @get "tCredentialsNotUpdated"
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
        that.get("notify").success tCredentialsUpdated
      .catch (error) ->
        that.get("notify").error tCredentialsNotUpdated
        for error in error.errors
          that.get("notify").error error.detail?.message
`export default TestCredentialsComponent`
