`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

TeamMemberComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  team: null
  tagName: ["tr"]

  isRemovingMember: false

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
    @set "isRemovingMember", true
    @get("ajax").delete url
    .then (data)->
      that.set "isRemovingMember", false
      that.store.pushPayload data
      that.get("notify").success "#{tTeamMember} #{teamMember} #{tTeamMemberRemoved}"
    .catch (error) ->
      that.set "isRemovingMember", false
      that.get("notify").error error.payload.message
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:

    openRemoveMemberPrompt: ->
      @set "showRemoveMemberPrompt", true

    closeRemoveMemberPrompt: ->
      @set "showRemoveMemberPrompt", false


`export default TeamMemberComponent`
