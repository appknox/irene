`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

TeamMemberComponent = Ember.Component.extend
  team: null
  tagName: ["tr"]

  actions:

    removeMember: ->
      teamMember = @get "member"
      deletedMember = prompt "Enter the username which you want to delete ", ""
      if deletedMember is null
        return
      else if deletedMember isnt teamMember
        return @get("notify").error "Enter the right username to delete it"
      teamId = @get "team.id"
      url = [ENV.endpoints.teams, teamId, ENV.endpoints.members, teamMember].join '/'
      that = @
      @get("ajax").delete url
      .then (data)->
        that.store.pushPayload data
        that.get("notify").success "Team member #{teamMember} will be deleted shortly"
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default TeamMemberComponent`
