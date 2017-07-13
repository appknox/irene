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
      team = @get('store').createRecord('team', { name: teamName})
      that = @
      team.save()
      .then ()->
        that.get("notify").success "Team Created Successfully"
        that.set "teamName", ""
        that.set "showTeamModal", false
      .catch (error) ->
        team.destroyRecord()
        for error in error.errors
          debugger
          if error.status is "412"
            that.get("notify").error "Team already exists"
          that.get("notify").error error.detail?.message


`export default CreateTeamComponent`
