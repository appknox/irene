`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

isEmpty = (inputValue)->
  return Ember.isEmpty inputValue

TeamDetailsComponent = Ember.Component.extend

  i18n: Ember.inject.service()

  team: null
  teamMember: ""

  invitations: (->
    @get("store").findAll "invitation"
  ).property()

  tEmptyEmailId: t("emptyEmailId")
  tTeamMemberAdded: t("teamMemberAdded")
  tTeamMemberInvited: t("teamMemberInvited")

  actions:

    openAddMemberModal: ->
      @set "showAddMemberModal", true

    closeAddMemberModal: ->
      @set "showAddMemberModal", false

    addMember: ->
      teamMember = @get "teamMember"
      tEmptyEmailId = @get "tEmptyEmailId"
      tTeamMemberAdded = @get "tTeamMemberAdded"
      tTeamMemberInvited = @get "tTeamMemberInvited"
      teamId = @get "team.id"
      url = [ENV.endpoints.teams, teamId, ENV.endpoints.members].join '/'
      that = @
      for inputValue in [teamMember]
        return @get("notify").error tEmptyEmailId if isEmpty inputValue
      data =
        identification: teamMember
      @get("ajax").post url, data: data
      .then (data)->
        if data?.data?.type is "team"
          that.store.pushPayload data
          that.get("notify").success tTeamMemberAdded
        else
          that.get("notify").success tTeamMemberInvited
        that.set "teamMember", ""
        that.set "showAddMemberModal", false
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default TeamDetailsComponent`
