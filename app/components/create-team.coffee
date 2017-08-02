`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

isEmpty = (inputValue)->
  return Ember.isEmpty inputValue

CreateTeamComponent = Ember.Component.extend

  i18n: Ember.inject.service()

  teamName: ""

  tTeamCreated: t("teamCreated")
  tEnterTeamName: t("enterTeamName")

  actions:
    openTeamModal: ->
      @set "showTeamModal", true

    createTeam: ->
      teamName = @get "teamName"
      tTeamCreated = @get "tTeamCreated"
      tEnterTeamName = @get "tEnterTeamName"

      for inputValue in [teamName]
        return @get("notify").error tEnterTeamName if isEmpty inputValue
      that = @
      data =
        name: teamName
      @get("ajax").post ENV.endpoints.teams, data: data
      .then (data)->
        that.store.pushPayload data
        that.get("notify").success tTeamCreated
        that.set "teamName", ""
        that.set "showTeamModal", false
      .catch (error) ->
        that.get("notify").error error.payload.error
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default CreateTeamComponent`
