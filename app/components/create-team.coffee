`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

isEmpty = (inputValue)->
  return Ember.isEmpty inputValue

CreateTeamComponent = Ember.Component.extend

  teamName: ""

  actions:
    openTeamModal: ->
      @set "showTeamModal", true

    createTeam: ->
      teamName = @get "teamName"
      for inputValue in [teamName]
        return @get("notify").error "Please enter the team name" if isEmpty inputValue
      that = @
      data =
        name: teamName
      @get("ajax").post ENV.endpoints.teams, data: data
      .then (data)->
        that.store.pushPayload data
        that.get("notify").success "Team Created Successfully"
        that.set "teamName", ""
        that.set "showTeamModal", false
      .catch (error) ->
        that.get("notify").error error.payload.error
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default CreateTeamComponent`
