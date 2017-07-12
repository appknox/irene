`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

isEmpty = (inputValue)->
  return Ember.isEmpty inputValue

CreateTeamComponent = Ember.Component.extend

  teamName: ""

  team: (->
   @get('store').createRecord('team')
  ).property()

  actions:
    openTeamModal: ->
      @set "showTeamModal", true

    createTeam: ->
      teamName = @get "team.name"
      for inputValue in [teamName]
        return @get("notify").error "Please enter the team name" if isEmpty inputValue
      team = @get 'team'
      team.save()
      that = @
      .then ()->
        that.get("notify").success "Team Created Successfully"
        that.set "teamName", ""
        that.set "showTeamModal", false
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default CreateTeamComponent`
