`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

TeamOverviewComponent = Ember.Component.extend

  i18n: Ember.inject.service()
  team: null
  classNames: ["column" , "is-one-third"]

  tTeam: t("team")
  tTeamDeleted: t("teamDeleted")
  tEnterRightTeamName: t("enterRightTeamName")

  promptCallback: (promptedItem) ->
    tTeam = @get "tTeam"
    tTeamDeleted = @get "tTeamDeleted"
    tEnterRightTeamName = @get "tEnterRightTeamName"
    team = @get "team"
    deletedTeam = team.get("name")
    teamName = deletedTeam.toLowerCase()
    promptedTeam = promptedItem.toLowerCase()
    if promptedTeam isnt teamName
      return @get("notify").error tEnterRightTeamName
    that = @
    team.destroyRecord()
    .then ()->
      that.get("notify").success "#{tTeam} - #{deletedTeam} #{tTeamDeleted} "
    .catch (error) ->
      that.get("notify").error error.payload.message
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:
    openDeleteTeamPrompt: ->
      @set "showDeleteTeamPrompt", true

    closeDeleteTeamPrompt: ->
      @set "showDeleteTeamPrompt", false


`export default TeamOverviewComponent`
