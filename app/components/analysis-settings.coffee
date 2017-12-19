`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

AnalysisSettingsComponent = Ember.Component.extend

  project: null
  i18n: Ember.inject.service()
  tSavedPreferences: t("savedPreferences")

  actions:

    showUnknownAnalysis: ->
      tSavedPreferences = @get "tSavedPreferences"
      isChecked = @$('#show-unkown-analysis')[0].checked
      data =
        project_id: @get "project.id"
        status: isChecked
      that = @
      @get("ajax").post ENV.endpoints.setUnknownAnalysisStatus, data: data
      .then (data)->
        that.set "project.showUnknownAnalysis", isChecked
        that.get("notify").success tSavedPreferences
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default AnalysisSettingsComponent`
