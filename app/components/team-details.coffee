`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

isEmpty = (inputValue)->
  return Ember.isEmpty inputValue

TeamDetailsComponent = Ember.Component.extend
  team: null
  teamMember: ""

  actions:

    openAddMemberModal: ->
      @set "showAddMemberModal", true

    closeAddMemberModal: ->
      @set "showAddMemberModal", false

    addMember: ->
      teamMember = @get "teamMember"
      teamId = @get "team.id"
      url = [ENV.endpoints.teams, teamId, ENV.endpoints.members].join '/'
      that = @
      for inputValue in [teamMember]
        return @get("notify").error "Please Enter the email" if isEmpty inputValue
      data =
        identification: teamMember
      @get("ajax").post url, data: data
      .then (data)->
        if data?.data?.type is "team"
          that.store.pushPayload data
          that.get("notify").success "Team member added"
        else
          that.get("notify").success "Team member invited"  
        that.set "teamMember", ""
        that.set "showAddMemberModal", false
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default TeamDetailsComponent`
