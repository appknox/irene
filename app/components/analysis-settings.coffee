`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

AnalysisSettingsComponent = Ember.Component.extend

  project: null

  actions:

    showUnknownAnalysis: ->
      checked = @$('#show-unkown-analysis')[0].checked
      data =
        project_id: @get "project.id"
        show_unknown_analysis: checked
      that = @
      @get("ajax").post ENV.endpoints.setUnknownAnalysisStatus, data: data
      .then (data)->
        that.set "project.showUnknownAnalysis", checked
        that.get("notify").success "Successfully saved the preferences"
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default AnalysisSettingsComponent`
