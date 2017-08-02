`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

TeamMemberComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  team: null
  tagName: ["tr"]

  tEnterRightUserName: t("enterRightUserName")
  tTeamMember: t("teamMember")
  tTeamMemberRemoved: t("teamMemberRemoved")

  promptCallback: (promptedItem) ->
    tTeamMember = @get "tTeamMember"
    tTeamMemberRemoved = @get "tTeamMemberRemoved"
    tEnterRightUserName = @get "tEnterRightUserName"
    teamMember = @get "member"
    if promptedItem isnt teamMember
      return @get("notify").error tEnterRightUserName
    teamId = @get "team.id"
    url = [ENV.endpoints.teams, teamId, ENV.endpoints.members, teamMember].join '/'
    that = @
    @get("ajax").delete url
    .then (data)->
      that.store.pushPayload data
      that.get("notify").success "#{tTeamMember} #{teamMember} #{tTeamMemberRemoved}"
    .catch (error) ->
      that.get("notify").error error.payload.message
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:

    openRemoveMemberPrompt: ->
      @set "showRemoveMemberPrompt", true

    closeRemoveMemberPrompt: ->
      @set "showRemoveMemberPrompt", false


`export default TeamMemberComponent`
